const db = require('../models')

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(stringMonth)) {
    const [periodYear, periodMonth] = stringMonth.split('-')
    parsedYear = Number(periodYear)
    parsedMonth = Number(periodMonth)
  } else {
    parsedMonth = Number(stringMonth)
    parsedYear = Number(year)

    if (!Number.isInteger(parsedYear)) {
      throw { status: 400, message: 'El year es requerido cuando month se envia como numero' }
    }
  }

  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    throw { status: 400, message: 'El month debe ser un numero entre 1 y 12 o formato YYYY-MM' }
  }

  if (!Number.isInteger(parsedYear) || parsedYear < 1900) {
    throw { status: 400, message: 'El year debe ser un numero valido' }
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

  if (!UUID_PATTERN.test(normalizedStoreId)) {
    throw { status: 400, message: 'El storeId debe ser un UUID valido' }
  }

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

async function getProductReport(req, res) {
  try {
    const monthPeriod = buildMonthPeriod(req.query)
    const storeFilter = buildStoreFilter(req.query.storeId)
    const replacements = {
      ...monthPeriod.replacements,
      ...storeFilter.replacements
    }

    const productRows = await db.sequelize.query(
      `
      WITH sales AS (
        SELECT
          bd.product_id,
          SUM(bd.quantity) AS quantity_sold,
          SUM((bd.sell_price - COALESCE(p.buy_price, 0)) * bd.quantity) AS gross_gain,
          SUM(COALESCE(bd.total, bd.sell_price * bd.quantity) - (COALESCE(p.buy_price, 0) * bd.quantity)) AS net_gain
        FROM cd.bill_details bd
        INNER JOIN cd.bills b ON b.bill_id = bd.bill_id
        INNER JOIN cd.products p ON p.product_id = bd.product_id
        WHERE bd.deleted_at IS NULL
          AND b.deleted_at IS NULL
          ${monthPeriod.dateFilter}
          ${storeFilter.billFilter}
        GROUP BY bd.product_id
      ),
      inventory AS (
        SELECT
          si.product_id,
          SUM(si.in_stock) AS in_stock
        FROM cd.stores_inventories si
        ${storeFilter.inventoryFilter}
        GROUP BY si.product_id
      )
      SELECT
        p.product_id AS "productId",
        p.name,
        COALESCE(s.quantity_sold, 0) AS "quantitySold",
        COALESCE(i.in_stock, 0) AS "inStock",
        COALESCE(s.gross_gain, 0) AS "grossGain",
        COALESCE(s.net_gain, 0) AS "netGain"
      FROM cd.products p
      LEFT JOIN sales s ON s.product_id = p.product_id
      LEFT JOIN inventory i ON i.product_id = p.product_id
      WHERE p.deleted_at IS NULL
      ORDER BY p.name ASC
      `,
      {
        replacements,
        type: db.Sequelize.QueryTypes.SELECT
      }
    )

    const storeRows = await db.sequelize.query(
      `
      WITH sales AS (
        SELECT
          bd.product_id,
          b.store_id,
          SUM(bd.quantity) AS quantity_sold,
          SUM((bd.sell_price - COALESCE(p.buy_price, 0)) * bd.quantity) AS gross_gain,
          SUM(COALESCE(bd.total, bd.sell_price * bd.quantity) - (COALESCE(p.buy_price, 0) * bd.quantity)) AS net_gain
        FROM cd.bill_details bd
        INNER JOIN cd.bills b ON b.bill_id = bd.bill_id
        INNER JOIN cd.products p ON p.product_id = bd.product_id
        WHERE bd.deleted_at IS NULL
          AND b.deleted_at IS NULL
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
        ${storeFilter.inventoryFilter}
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
        storeId: storeFilter.normalizedStoreId
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
    const replacements = {
      ...monthPeriod.replacements,
      ...storeFilter.replacements
    }

    const storeRows = await db.sequelize.query(
      `
      SELECT
        st.store_id AS "storeId",
        st.address,
        st.is_active AS "isOperating",
        COALESCE(
          SUM(COALESCE(bd.total, bd.sell_price * bd.quantity) - (COALESCE(p.buy_price, 0) * bd.quantity)),
          0
        ) AS "monthlyGrossGain",
        COALESCE(
          SUM(COALESCE(bd.total, bd.sell_price * bd.quantity) - (COALESCE(p.buy_price, 0) * bd.quantity)),
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
      WHERE st.deleted_at IS NULL
        AND st.store_id = :storeId
      GROUP BY st.store_id, st.address, st.is_active
      `,
      {
        replacements,
        type: db.Sequelize.QueryTypes.SELECT
      }
    )

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

module.exports = {
  getProductReport,
  getStoreReport,
  buildMonthPeriod,
  buildCurrentMonthPeriod,
  buildStoreFilter,
  buildRequiredStoreFilter,
  mapProductRows,
  mapStoreRows,
  mapEmployeeRows,
  mapStoreReportRow
}
