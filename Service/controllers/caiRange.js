const db = require('../models')
const { CaiRanges } = require('../models/entities/caiRange')
const { Cais } = require('../models/entities/cai')
const{Op}=require('sequelize')
const{Bills}=require('../models/entities/bill')


// Crear rango de CAI
const createCaiRange = async (req, res) => {

  try {
    const { minRange, maxRange, expirationDate, caiId } = req.body
    
    if (minRange === undefined || minRange === null) {
      return res.status(400).json({ message: 'El rango inicial es requerido' })
    }

    if (maxRange === undefined || maxRange === null) {
      return res.status(400).json({ message: 'El rango final es requerido' })
    }

    const parsedMinRange=Number(minRange)
    const parsedMaxRange=Number(maxRange)

    if(isNaN(Number(parsedMinRange))||isNaN(Number(parsedMaxRange)))
    {
      
      return res.status(400).json({message:'Los rangos deben ser numeros validos'})
      
    }
    
    if(parsedMinRange<0||parsedMaxRange<0)
      {
        
      return res.status(400).json({message:'Los rangos no pueden ser negativos'})

    }

    if (Number(parsedMinRange) > Number(parsedMaxRange)) {
      return res.status(400).json({ message: 'El rango inicial no puede ser mayor al rango final' })
    }

    if (!expirationDate || expirationDate.trim() === '') {
      return res.status(400).json({ message: 'La fecha de expiracion es requerida' })
    }

    const parsedRangeDate=new Date(expirationDate)
    
    if(isNaN(parsedRangeDate.getTime()))
    {
        
      return res.status(400).json({message:'La fecha de expiracion del rango no es valida'})
        
    }

    const today=new Date()

    today.setHours(0,0,0,0)
    parsedRangeDate.setHours(0,0,0,0)

    if(parsedRangeDate<=new Date())
    {
          
      return res.status(400).json({message:'La fecha de expiracion del rango debe ser futura'})
          
    }
        
    if (!caiId || caiId.trim() === '') {
      return res.status(400).json({ message: 'El id del CAI es requerido' })
    }
        
    const cai = await Cais.findByPk(caiId)
        
    if (!cai) {
      return res.status(404).json({ message: 'CAI no encontrado' })
    }
        
    if (!cai.isActive) {
      return res.status(400).json({ message: 'El CAI debe estar activo para asociar un rango' })
    }

    //validar expiracion del cai
    const caiExpirationDate=new Date(cai.expirationDate)

    caiExpirationDate.setHours(0,0,0,0)

    if(caiExpirationDate<=today)
    {

      return res.status(400).json({message:'El cai ha expirado'})

    }
        
    //busca si eexiste un rango que: toque el inicio el final y envuelva completamente el nuevo rango
    const rangoSuperpuesto=await CaiRanges.findOne(
    {
      where:
      {
        caiId,
        
        [Op.or]:[

          {

            minRange:{[Op.between]:[parsedMinRange,parsedMaxRange]}

          },

          {

            maxRange:{[Op.between]:[parsedMinRange,parsedMaxRange]}

          },

          {
            
            [Op.and]:[
              
              {
                
                minRange:{[Op.lte]:[parsedMinRange]}
                
              },
              
              {

                maxRange:{[Op.gte]:parsedMaxRange}

              }
              
            ]
            
          }
      
        ]
      }
    })
    if(rangoSuperpuesto)
    {

      return res.status(400).json({message:'El rango se solapa con otro rango existente'})

    }

    const caiRange = await db.sequelize.transaction(async (transaction) => {
      await CaiRanges.update(
        { isActive: false },
        {
          where: {
            caiId,
            isActive: true
          },
          transaction
        }
      )

      return await CaiRanges.create(
        {
          minRange,
          maxRange,
          expirationDate,
          caiId,
          isActive: true
        },
        { transaction }
      )
    })

    res.status(201).json({
      message: 'Rango de CAI creado correctamente',
      caiRange
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener rangos paginados
const getCaiRanges = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const caiRanges = await CaiRanges.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Cais,
          as: 'Cai'
        }
      ]
    })

    res.json({
      total: caiRanges.count,
      caiRanges: caiRanges.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener rangos paginados por CAI
const getCaiRangesByCai = async (req, res) => {
  try {
    const { caiId } = req.params
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const cai = await Cais.findByPk(caiId)

    if (!cai) {
      return res.status(404).json({ message: 'CAI no encontrado' })
    }

    const caiRanges = await CaiRanges.findAndCountAll({
      where: { caiId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Cais,
          as: 'Cai'
        }
      ]
    })

    res.json({
      total: caiRanges.count,
      caiRanges: caiRanges.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener rango por id
const getCaiRangeById = async (req, res) => {
  try {
    const { id } = req.params

    const caiRange = await CaiRanges.findByPk(id, {
      include: [
        {
          model: Cais,
          as: 'Cai'
        }
      ]
    })

    if (!caiRange) {
      return res.status(404).json({ message: 'Rango de CAI no encontrado' })
    }

    res.json(caiRange)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Actualizar rango
const updateCaiRange = async (req, res) => {
  try 
  {
    const { id } = req.params
    const { minRange, maxRange, expirationDate } = req.body

    const caiRange = await CaiRanges.findByPk(id)

    if (!caiRange) {
      return res.status(404).json({ message: 'Rango de CAI no encontrado' })
    }

    const existingBills=await Bills.count({where:{caiRangeId:caiRange.caiRangeId}})

    if(existingBills>0&&(minRange!==undefined||maxRange!==undefined))
    {

      return res.status(400).json({message:'No se puede modificar el rango porque ya existen facturas emitidas'})

    }

    const dataToUpdate = {}

    if (minRange !== undefined) 
    {

      if(isNaN(Number(minRange))||Number(minRange)<0)
      {

        return res.status(400).json({message:'El rango inicial no es un numero valido'})

      }
      dataToUpdate.minRange = Number(minRange)

    }

    if (maxRange !== undefined) 
    {

      if(isNaN(Number(maxRange))||Number(maxRange)<0)
      {

        return res.status(400).json({message:'El rango final no es un numero valido'})

      }
      dataToUpdate.maxRange = Number(maxRange)

    }

    const newMinRange = dataToUpdate.minRange ?? caiRange.minRange
    const newMaxRange = dataToUpdate.maxRange ?? caiRange.maxRange

    if (Number(newMinRange) > Number(newMaxRange)) {
      return res.status(400).json({ message: 'El rango inicial no puede ser mayor al rango final' })
    }

    if (minRange !== undefined||maxRange!==undefined) 
    {

      const rangoSuperpuesto=await CaiRanges.findOne(
      {
        where:
        {
          caiId:caiRange.caiId,
          caiRangeId:{[Op.ne]:caiRange.caiRangeId},//excluir el rango q se esata edtando

          [Op.or]:[

            {

              minRange:{[Op.between]:[newMinRange,newMaxRange]}

            },

            {

              maxRange:{[Op.between]:[newMinRange,newMaxRange]}

            },

            {

              [Op.and]:[

                {

                  minRange:{[Op.lte]:newMinRange}

                },

                {

                  maxRange:{[Op.gte]:newMaxRange}

                }

              ]

            }

          ]
        }
      })

      if(rangoSuperpuesto)
      {

        return res.status(400).json({message:'El rango se solapa con otro rango existente'})

      }
    }

    if (expirationDate!==undefined) 
    {

      if(!expirationDate||expirationDate.trim()==='')
      {

        return res.status(400).json({ message: 'La fecha de expiracion no puede estar vacia' })

      }
      const parsedRangeDate=new Date(expirationDate)
      if(isNaN(parsedRangeDate.getTime()))
      {

        return res.status(400).json({ message: 'La fecha de expiracion no es valida' })

      }

      const today=new Date()

      today.setHours(0,0,0,0)
      parsedRangeDate.setHours(0,0,0,0)

      if(parsedRangeDate<=today)
      {

        return res.status(400).json({message:'La fecha de expiracion debe ser futura'})

      }
      
      dataToUpdate.expirationDate = expirationDate

    }

    await caiRange.update(dataToUpdate)

    res.json({message: 'Rango de CAI actualizado correctamente',caiRange})

  } catch (error) {
    res.status(500).json({ message: error.message })
  }

}

// Eliminar rango
const deleteCaiRange = async (req, res) => {
  try {
    const { id } = req.params

    const caiRange = await CaiRanges.findByPk(id)

    if (!caiRange) {
      return res.status(404).json({ message: 'Rango de CAI no encontrado' })
    }

    const existingBills=await Bills.count({where:{caiRangeId:caiRange.caiRangeId}})
    
    if(existingBills>0)    
    {

      return res.status(400).json({message:'No se puede eliminar el rango porque tiene facturas asociadas'})

    }

    await caiRange.destroy()

    res.json({ message: 'Rango de CAI eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createCaiRange,
  getCaiRanges,
  getCaiRangesByCai,
  getCaiRangeById,
  updateCaiRange,
  deleteCaiRange
}