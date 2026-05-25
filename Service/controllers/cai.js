const db = require('../models')
const { Cais } = require('../models/entities/cai')
const { CaiRanges } = require('../models/entities/caiRange')
const{Op}=require('sequelize')

// Crear CAI con rango
const createCai = async (req, res) => {
  try {
    const { governmentId, expirationDate, range } = req.body

    if (!governmentId || governmentId.trim() === '') {
      return res.status(400).json({ message: 'El numero de CAI es requerido' })
    }

    if (!expirationDate || expirationDate.trim() === '') {
      return res.status(400).json({ message: 'La fecha de expiracion del CAI es requerida' })
    }

    const parsedCaiDate=new Date(expirationDate)
    if(isNaN(parsedCaiDate.getTime()))
    {

      return res.status(400).json({ message: 'La fecha de expiracion del CAI no es valida' })

    }

    if(parsedCaiDate<=new Date())
    {

      return res.status(400).json({message:'La fecha de expiracion del CAI debe ser futura'})

    }

    if (!range) {
      return res.status(400).json({ message: 'El rango del CAI es requerido' })
    }

    const { minRange, maxRange, expirationDate: rangeExpirationDate } = range

    if (minRange === undefined || minRange === null) {
      return res.status(400).json({ message: 'El rango inicial es requerido' })
    }

    if (maxRange === undefined || maxRange === null) {
      return res.status(400).json({ message: 'El rango final es requerido' })
    }

    if(isNaN(Number(minRange))||isNaN(Number(maxRange)))
    {

      return res.status(400).json({message:'Los rangos deben ser numeros validos'})

    }

    if(Number(minRange)<0||Number(maxRange)<0)
    {

      return res.status(400).json({message:'Los rangos no pueden ser negativos'})

    }
    
    if (Number(minRange) > Number(maxRange)) {
      return res.status(400).json({ message: 'El rango inicial no puede ser mayor al rango final' })
    }
    if (!rangeExpirationDate || rangeExpirationDate.trim() === '') {
      return res.status(400).json({ message: 'La fecha de expiracion del rango es requerida' })
    }

    const parsedRangeDate=new Date(rangeExpirationDate)
    if(isNaN(parsedRangeDate.getTime()))
    {

      return res.status(400).json({message:'La fecha de expiracion del rango no es valida'})

    }
    if(parsedRangeDate<=new Date())
    {

      return res.status(400).json({message:'La fecha de expiracion del rango debe ser futura'})

    }

    const existingCai = await Cais.findOne({ where: { governmentId } })

    if (existingCai) {
      return res.status(400).json({ message: 'Ya existe un CAI con ese numero' })
    }

    //se verifica primeroo el solapamiento del rango inicial contra todos los rango iniciale 
    const rangoSuperpuesto=await CaiRanges.findOne({where:{[Op.or]:[

      {

        minRange:{[Op.between]:[minRange,maxRange]}
      
      },
      {

        maxRange:{[Op.between]:[minRange,maxRange]}

      },
      {

        [Op.and]:[

          {

            minRange:{[Op.lte]:minRange}

          },

          {

            maxRange:{[Op.gte]:maxRange}

          }

        ]
      }
      
    ]}})

    if(rangoSuperpuesto)
    {

      return res.status(400).json({message:'El rango se solapa con otro rango existente'})

    }

    const cai = await db.sequelize.transaction(async (transaction) => {
      await Cais.update(
        { isActive: false },
        {
          where: { isActive: true },
          transaction
        }
      )

      return await Cais.create(
        {
          governmentId,
          expirationDate,
          isActive: true,
          caiRanges: [
            {
              minRange,
              maxRange,
              expirationDate: rangeExpirationDate,
              isActive: true
            }
          ]
        },
        {
          include: [
            {
              model: CaiRanges,
              as: 'caiRanges'
            }
          ],
          transaction
        }
      )
    })

    res.status(201).json({
      message: 'CAI creado correctamente',
      cai
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Listado paginado
const getCais = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const cais = await Cais.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: CaiRanges,
          as: 'caiRanges'
        }
      ]
    })

    res.json({
      total: cais.count,
      cais: cais.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Eliminar CAI
const deleteCai = async (req, res) => {
  try {
    const { id } = req.params

    const cai = await Cais.findByPk(id)

    if (!cai) {
      return res.status(404).json({ message: 'CAI no encontrado' })
    }

    await db.sequelize.transaction(async(transaction)=>
    {

      //delete en cascada de todos los rangos asociados
      await CaiRanges.update({isActive:false},{where:{caiId:cai.caiId},transaction})

      await CaiRanges.destroy({where:{caiId:cai.caiId},transaction})

      await cai.destroy({transaction})

    })

    res.json({ message: 'CAI eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createCai,
  getCais,
  deleteCai
}