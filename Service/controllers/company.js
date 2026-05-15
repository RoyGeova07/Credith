const { Companies } = require('../models/entities/company')

// Crear empresa
const createCompany = async (req, res) => {
  try {
    const { name, rtn, email, address } = req.body

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'El nombre de la empresa es requerido' })
    }

    if (!rtn || rtn.trim() === '') {
      return res.status(400).json({ message: 'El RTN es requerido' })
    }

    const existingCompany = await Companies.findOne({ where: { rtn } })

    if (existingCompany) {
      return res.status(400).json({ message: 'Ya existe una empresa con ese RTN' })
    }

    const company = await Companies.create({
      name,
      rtn,
      email,
      address
    })

    res.status(201).json({
      message: 'Empresa creada correctamente',
      company
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener empresas
const getCompanies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const companies = await Companies.findAndCountAll({
      limit,
      offset
    })

    res.json({
      total: companies.count,
      companies: companies.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener empresa por id
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params

    const company = await Companies.findByPk(id)

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' })
    }

    res.json(company)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Actualizar empresa
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params
    const { name, rtn, email, address } = req.body

    const company = await Companies.findByPk(id)

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' })
    }

    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ message: 'El nombre de la empresa no puede estar vacío' })
    }

    if (rtn !== undefined && rtn.trim() === '') {
      return res.status(400).json({ message: 'El RTN no puede estar vacío' })
    }

    if (rtn && rtn !== company.rtn) {
      const existingCompany = await Companies.findOne({ where: { rtn } })

      if (existingCompany) {
        return res.status(400).json({ message: 'Ya existe una empresa con ese RTN' })
      }
    }

    await company.update({
      name,
      rtn,
      email,
      address
    })

    res.json({
      message: 'Empresa actualizada correctamente',
      company
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Eliminar empresa
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params

    const company = await Companies.findByPk(id)

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' })
    }

    await company.destroy()

    res.json({ message: 'Empresa eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
}