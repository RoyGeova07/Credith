const db = require('../models')

function padMonth(month) {
  return String(month).padStart(2, '0')
}

function buildMonthlyDateRange(parsedYear, parsedMonth) {
  const nextMonth = parsedMonth === 12 ? 1 : parsedMonth + 1
  const nextYear = parsedMonth === 12 ? parsedYear + 1 : parsedYear
  const startDate = `${parsedYear}-${padMonth(parsedMonth)}-01`
  const endDate = `${nextYear}-${padMonth(nextMonth)}-01`

  return {
    period: {
      type: 'month',
      year: parsedYear,
      month: parsedMonth,
      startDate,
      endDate
    },
    dateFilter: 'AND b.created_at >= :startDate AND b.created_at < :endDate',
    replacements: {
      startDate,
      endDate
    }
  }
}

function buildMonthPeriod(query) {
  const month = query.month
  const year = query.year

  if ((month === undefined || month === null || month === '') && (year === undefined || year === null || year === '')) {
    return {
      period: {
        type: 'historical'
      },
      dateFilter: '',
      replacements: {}
    }
  }

  const stringMonth = String(month || '').trim()
  let parsedMonth
  let parsedYear

  if (/^\d{4}-\d{2}$/.test(stringMonth)) {
    const [periodYear, periodMonth] = stringMonth.split('-')
    parsedYear = Number(periodYear)
    parsedMonth = Number(periodMonth)
  } else if (/^\d{4}-/.test(stringMonth)) {
    throw { status: 400, message: 'El mes debe ser un numero entre 1 y 12 o formato YYYY-MM' }
  } else {
    parsedMonth = Number(stringMonth)
    parsedYear = Number(year)

    if (!Number.isInteger(parsedYear)) {
      throw { status: 400, message: 'El año es requerido cuando mes se envia como numero' }
    }
  }

  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    throw { status: 400, message: 'El mes debe ser un numero entre 1 y 12 o formato YYYY-MM' }
  }

  if (!Number.isInteger(parsedYear) || parsedYear < 1900) {
    throw { status: 400, message: 'El año debe ser un numero valido' }
  }

  return buildMonthlyDateRange(parsedYear, parsedMonth)
}

function buildCurrentMonthPeriod(query, currentDate = new Date()) {
  const month = query.month
  const year = query.year

  if ((month === undefined || month === null || month === '') && (year === undefined || year === null || year === '')) {
    return buildMonthlyDateRange(currentDate.getFullYear(), currentDate.getMonth() + 1)
  }

  return buildMonthPeriod(query)
}

function buildStoreFilter(storeId) {
  if (storeId === undefined || storeId === null || storeId === '') {
    return {
      normalizedStoreId: null,
      billFilter: '',
      inventoryFilter: '',
      replacements: {}
    }
  }

  const normalizedStoreId = String(storeId).trim()
  return {
    normalizedStoreId,
    billFilter: 'AND b.store_id = :storeId',
    inventoryFilter: 'WHERE si.store_id = :storeId',
    replacements: {
      storeId: normalizedStoreId
    }
  }
}

function buildRequiredStoreFilter(storeId) {
  const storeFilter = buildStoreFilter(storeId)

  if (!storeFilter.normalizedStoreId) {
    throw { status: 400, message: 'El storeId es requerido para generar el reporte de tienda' }
  }

  return storeFilter
}

function buildRequiredCompanyFilter(companyId) {
  if (companyId === undefined || companyId === null || companyId === '') {
    throw { status: 400, message: 'El companyId es requerido para generar el reporte de compañia' }
  }

  const normalizedCompanyId = String(companyId).trim()

  return {
    normalizedCompanyId,
    replacements: {
      companyId: normalizedCompanyId
    }
  }
}

function buildPagination(query) {
  const parsedLimit = Number.parseInt(query.limit, 10)
  const parsedOffset = Number.parseInt(query.offset, 10)

  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, 100)
    : 10
  const offset = Number.isInteger(parsedOffset) && parsedOffset >= 0
    ? parsedOffset
    : 0

  return {
    limit,
    offset,
    replacements: {
      limit,
      offset
    }
  }
}

function toInteger(value) {
  return Number.parseInt(value || 0, 10)
}

function toMoney(value) {
  return Number(Number(value || 0).toFixed(2))
}

function mapStoreRows(storeRows) {
  const storesByProduct = new Map()

  for (const row of storeRows) {
    const store = {
      storeId: row.storeId,
      address: row.address,
      quantitySold: toInteger(row.quantitySold),
      inStock: toInteger(row.inStock),
      grossGain: toMoney(row.grossGain),
      netGain: toMoney(row.netGain)
    }

    const productStores = storesByProduct.get(row.productId) || []
    productStores.push(store)
    storesByProduct.set(row.productId, productStores)
  }

  return storesByProduct
}

function mapProductRows(productRows, storesByProduct) {
  return productRows.map((row) => ({
    productId: row.productId,
    name: row.name,
    quantitySold: toInteger(row.quantitySold),
    inStock: toInteger(row.inStock),
    grossGain: toMoney(row.grossGain),
    netGain: toMoney(row.netGain),
    stores: storesByProduct.get(row.productId) || []
  }))
}

function buildSelectedProductsCte(monthPeriod, storeFilter) {
  const inventoryStoreFilter = storeFilter.normalizedStoreId ? 'AND si.store_id = :storeId' : ''

  return `
      selected_products AS (
        SELECT DISTINCT
          p.product_id,
          p.name
        FROM cd.products p
        WHERE p.deleted_at IS NULL
          AND (
            EXISTS (
              SELECT 1
              FROM cd.stores_inventories si
              INNER JOIN cd.stores st ON st.store_id = si.store_id
              WHERE si.product_id = p.product_id
                AND st.deleted_at IS NULL
                AND st.company_id = :companyId
                ${inventoryStoreFilter}
            )
            OR EXISTS (
              SELECT 1
              FROM cd.bill_details bd
              INNER JOIN cd.bills b ON b.bill_id = bd.bill_id
              INNER JOIN cd.stores st ON st.store_id = b.store_id
              WHERE bd.product_id = p.product_id
                AND bd.deleted_at IS NULL
                AND b.deleted_at IS NULL
                AND st.deleted_at IS NULL
                AND st.company_id = :companyId
                ${monthPeriod.dateFilter}
                ${storeFilter.billFilter}
            )
          )
        ORDER BY p.name ASC
        LIMIT :limit
        OFFSET :offset
      )`
}

function buildFullName(row) {
  return [
    row.firstName,
    row.secondName,
    row.firstLastName,
    row.secondLastName
  ].filter(Boolean).join(' ')
}

function mapEmployeeRows(employeeRows) {
  return employeeRows.map((row) => ({
    userId: row.userId,
    fullName: buildFullName(row),
    email: row.email,
    isActive: Boolean(row.isActive)
  }))
}

function mapStoreReportRow(row, employeeRows) {
  return {
    storeId: row.storeId,
    address: row.address,
    isOperating: Boolean(row.isOperating),
    monthlyGrossGain: toMoney(row.monthlyGrossGain),
    monthlyNetGain: toMoney(row.monthlyNetGain),
    employees: mapEmployeeRows(employeeRows)
  }
}

function mapCompanyStoreReportRows(storeRows) {
  return storeRows.map((row) => ({
    storeId: row.storeId,
    address: row.address,
    isOperating: Boolean(row.isOperating),
    monthlyGrossGain: toMoney(row.monthlyGrossGain),
    monthlyNetGain: toMoney(row.monthlyNetGain)
  }))
}

function sumMoney(rows, field) {
  return toMoney(rows.reduce((total, row) => total + Number(row[field] || 0), 0))
}

function mapCompanyReportRow(companyRow, storeRows) {
  const stores = mapCompanyStoreReportRows(storeRows)

  return {
    companyId: companyRow.companyId,
    name: companyRow.name,
    rtn: companyRow.rtn,
    email: companyRow.email,
    stores,
    totalMonthlyGrossGain: sumMoney(stores, 'monthlyGrossGain'),
    totalMonthlyNetGain: sumMoney(stores, 'monthlyNetGain')
  }
}

async function getMonthlyStoreReportRows({ monthPeriod, storeId, companyId, activeOnly = false }) {
  const replacements = {
    ...monthPeriod.replacements
  }

  const filters = ['st.deleted_at IS NULL']

  if (storeId) {
    replacements.storeId = storeId
    filters.push('st.store_id = :storeId')
  }

  if (companyId) {
    replacements.companyId = companyId
    filters.push('st.company_id = :companyId')
  }

  if (activeOnly) {
    filters.push('st.is_active = true')
  }

  return await db.sequelize.query(
    `
    SELECT
      st.store_id AS "storeId",
      st.address,
      st.is_active AS "isOperating",
      COALESCE(
        SUM((COALESCE(bd.sell_price, 0) - COALESCE(p.buy_price, 0)) * COALESCE(bd.quantity, 0)),
        0
      ) AS "monthlyGrossGain",
      COALESCE(
        SUM(COALESCE(bd.total, COALESCE(bd.sell_price, 0) * COALESCE(bd.quantity, 0)) - (COALESCE(p.buy_price, 0) * COALESCE(bd.quantity, 0))),
        0
      ) AS "monthlyNetGain"
    FROM cd.stores st
    LEFT JOIN cd.bills b
      ON b.store_id = st.store_id
      AND b.deleted_at IS NULL
      ${monthPeriod.dateFilter}
    LEFT JOIN cd.bill_details bd
      ON bd.bill_id = b.bill_id
      AND bd.deleted_at IS NULL
    LEFT JOIN cd.products p
      ON p.product_id = bd.product_id
    WHERE ${filters.join(' AND ')}
    GROUP BY st.store_id, st.address, st.is_active
    ORDER BY st.address ASC
    `,
    {
      replacements,
      type: db.Sequelize.QueryTypes.SELECT
    }
  )
}

async function getProductReport(req, res) {
  try {
    const monthPeriod = buildMonthPeriod(req.query)
    const storeFilter = buildStoreFilter(req.query.storeId)
    const companyFilter = buildRequiredCompanyFilter(req.query.companyId)
    const pagination = buildPagination(req.query)
    const replacements = {
      ...monthPeriod.replacements,
      ...storeFilter.replacements,
      ...companyFilter.replacements,
      ...pagination.replacements
    }

    const productRows = await db.sequelize.query(
      `
      WITH ${buildSelectedProductsCte(monthPeriod, storeFilter)},
      sales AS (
        SELECT
          bd.product_id,
          SUM(bd.quantity) AS quantity_sold,
          SUM((bd.sell_price - COALESCE(p.buy_price, 0)) * bd.quantity) AS gross_gain,
          SUM(COALESCE(bd.total, bd.sell_price * bd.quantity) - (COALESCE(p.buy_price, 0) * bd.quantity)) AS net_gain
        FROM cd.bill_details bd
        INNER JOIN cd.bills b ON b.bill_id = bd.bill_id
        INNER JOIN cd.products p ON p.product_id = bd.product_id
        INNER JOIN cd.stores st ON st.store_id = b.store_id
        INNER JOIN selected_products sp ON sp.product_id = bd.product_id
        WHERE bd.deleted_at IS NULL
          AND b.deleted_at IS NULL
          AND st.deleted_at IS NULL
          AND st.company_id = :companyId
          ${monthPeriod.dateFilter}
          ${storeFilter.billFilter}
        GROUP BY bd.product_id
      ),
      inventory AS (
        SELECT
          si.product_id,
          SUM(si.in_stock) AS in_stock
        FROM cd.stores_inventories si
        INNER JOIN cd.stores st ON st.store_id = si.store_id
        INNER JOIN selected_products sp ON sp.product_id = si.product_id
        ${storeFilter.inventoryFilter}
        ${storeFilter.inventoryFilter ? 'AND' : 'WHERE'} st.deleted_at IS NULL
        AND st.company_id = :companyId
        GROUP BY si.product_id
      )
      SELECT
        sp.product_id AS "productId",
        sp.name,
        COALESCE(s.quantity_sold, 0) AS "quantitySold",
        COALESCE(i.in_stock, 0) AS "inStock",
        COALESCE(s.gross_gain, 0) AS "grossGain",
        COALESCE(s.net_gain, 0) AS "netGain"
      FROM selected_products sp
      LEFT JOIN sales s ON s.product_id = sp.product_id
      LEFT JOIN inventory i ON i.product_id = sp.product_id
      ORDER BY sp.name ASC
      `,
      {
        replacements,
        type: db.Sequelize.QueryTypes.SELECT
      }
    )

    const storeRows = await db.sequelize.query(
      `
      WITH ${buildSelectedProductsCte(monthPeriod, storeFilter)},
      sales AS (
        SELECT
          bd.product_id,
          b.store_id,
          SUM(bd.quantity) AS quantity_sold,
          SUM((bd.sell_price - COALESCE(p.buy_price, 0)) * bd.quantity) AS gross_gain,
          SUM(COALESCE(bd.total, bd.sell_price * bd.quantity) - (COALESCE(p.buy_price, 0) * bd.quantity)) AS net_gain
        FROM cd.bill_details bd
        INNER JOIN cd.bills b ON b.bill_id = bd.bill_id
        INNER JOIN cd.products p ON p.product_id = bd.product_id
        INNER JOIN cd.stores st ON st.store_id = b.store_id
        INNER JOIN selected_products sp ON sp.product_id = bd.product_id
        WHERE bd.deleted_at IS NULL
          AND b.deleted_at IS NULL
          AND st.deleted_at IS NULL
          AND st.company_id = :companyId
          ${monthPeriod.dateFilter}
          ${storeFilter.billFilter}
        GROUP BY bd.product_id, b.store_id
      ),
      inventory AS (
        SELECT
          si.product_id,
          si.store_id,
          SUM(si.in_stock) AS in_stock
        FROM cd.stores_inventories si
        INNER JOIN cd.stores st ON st.store_id = si.store_id
        INNER JOIN selected_products sp ON sp.product_id = si.product_id
        ${storeFilter.inventoryFilter}
        ${storeFilter.inventoryFilter ? 'AND' : 'WHERE'} st.deleted_at IS NULL
        AND st.company_id = :companyId
        GROUP BY si.product_id, si.store_id
      ),
      store_report AS (
        SELECT
          COALESCE(s.product_id, i.product_id) AS product_id,
          COALESCE(s.store_id, i.store_id) AS store_id,
          COALESCE(s.quantity_sold, 0) AS quantity_sold,
          COALESCE(i.in_stock, 0) AS in_stock,
          COALESCE(s.gross_gain, 0) AS gross_gain,
          COALESCE(s.net_gain, 0) AS net_gain
        FROM sales s
        FULL OUTER JOIN inventory i
          ON i.product_id = s.product_id
          AND i.store_id = s.store_id
      )
      SELECT
        sr.product_id AS "productId",
        sr.store_id AS "storeId",
        st.address,
        sr.quantity_sold AS "quantitySold",
        sr.in_stock AS "inStock",
        sr.gross_gain AS "grossGain",
        sr.net_gain AS "netGain"
      FROM store_report sr
      INNER JOIN cd.stores st ON st.store_id = sr.store_id
      WHERE st.deleted_at IS NULL
      ORDER BY st.address ASC
      `,
      {
        replacements,
        type: db.Sequelize.QueryTypes.SELECT
      }
    )

    const storesByProduct = mapStoreRows(storeRows)

    res.json({
      period: monthPeriod.period,
      filters: {
        companyId: companyFilter.normalizedCompanyId,
        storeId: storeFilter.normalizedStoreId
      },
      pagination: {
        limit: pagination.limit,
        offset: pagination.offset
      },
      products: mapProductRows(productRows, storesByProduct)
    })
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }

    res.status(500).json({ message: error.message })
  }
}

async function getStoreReport(req, res) {
  try {
    const monthPeriod = buildCurrentMonthPeriod(req.query)
    const storeFilter = buildRequiredStoreFilter(req.query.storeId)

    const storeRows = await getMonthlyStoreReportRows({
      monthPeriod,
      storeId: storeFilter.normalizedStoreId
    })

    if (storeRows.length === 0) {
      return res.status(404).json({ message: 'Tienda no encontrada' })
    }

    const employeeRows = await db.sequelize.query(
      `
      SELECT
        u.user_id AS "userId",
        u.first_name AS "firstName",
        u.second_name AS "secondName",
        u.first_last_name AS "firstLastName",
        u.second_last_name AS "secondLastName",
        u.email,
        u.is_active AS "isActive"
      FROM cd.users u
      WHERE u.deleted_at IS NULL
        AND u.store_id = :storeId
      ORDER BY u.first_name ASC, u.first_last_name ASC
      `,
      {
        replacements: {
          storeId: storeFilter.normalizedStoreId
        },
        type: db.Sequelize.QueryTypes.SELECT
      }
    )

    res.json({
      period: monthPeriod.period,
      filters: {
        storeId: storeFilter.normalizedStoreId
      },
      store: mapStoreReportRow(storeRows[0], employeeRows)
    })
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }

    res.status(500).json({ message: error.message })
  }
}

async function getCompanyReport(req, res) {
  try {
    const monthPeriod = buildCurrentMonthPeriod(req.query)
    const companyFilter = buildRequiredCompanyFilter(req.query.companyId)

    const companyRows = await db.sequelize.query(
      `
      SELECT
        c.company_id AS "companyId",
        c.name,
        c.rtn,
        c.email
      FROM cd.companies c
      WHERE c.deleted_at IS NULL
        AND c.company_id = :companyId
      `,
      {
        replacements: companyFilter.replacements,
        type: db.Sequelize.QueryTypes.SELECT
      }
    )

    if (companyRows.length === 0) {
      return res.status(404).json({ message: 'Compañia no encontrada' })
    }

    const storeRows = await getMonthlyStoreReportRows({
      monthPeriod,
      companyId: companyFilter.normalizedCompanyId,
      activeOnly: true
    })

    res.json({
      period: monthPeriod.period,
      filters: {
        companyId: companyFilter.normalizedCompanyId
      },
      company: mapCompanyReportRow(companyRows[0], storeRows)
    })
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }

    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getProductReport,
  getStoreReport,
  getCompanyReport,
  buildMonthPeriod,
  buildCurrentMonthPeriod,
  buildStoreFilter,
  buildRequiredStoreFilter,
  buildRequiredCompanyFilter,
  mapProductRows,
  mapStoreRows,
  mapEmployeeRows,
  mapStoreReportRow,
  mapCompanyStoreReportRows,
  mapCompanyReportRow,
  getMonthlyStoreReportRows
}
