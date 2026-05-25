const{createCai}=require('../controllers/cai')
const{createCaiRange, updateCaiRange}=require('../controllers/caiRange')
const{Cais}=require('../models/entities/cai')
const{CaiRanges}=require('../models/entities/caiRange')
const{Bills}=require('../models/entities/bill')
const db=require('../models')



//=======================MOCKS============================
jest.mock('../models/entities/cai')
jest.mock('../models/entities/caiRange')
jest.mock('../models/entities/bill',()=>
({

    Bills:{count:jest.fn()}

}))
jest.mock('../models',()=>
({

    sequelize:
    {

        transaction:jest.fn((cb)=>cb('mock-transaction'))

    }

}))

//helpers para constuir req/res falsos
const mockReq=(body={},params={})=>({body,params})
const mockRes=()=>
{

    const res={}
    res.status=jest.fn().mockReturnValue(res)
    res.json=jest.fn().mockReturnValue(res)
    return res

}


//==================LIMPIEZA ENTRE TESTS=========================
beforeEach(()=>
{

    jest.clearAllMocks()
    Bills.count.mockResolvedValue(0)

})

// =============================================================================
// TEST 1 — Validacion de rangos al crear un CAI
// Verifica que minRange y maxRange sean numeros validos y no negativos
// =============================================================================

describe('CAI - Validacion de rango',()=>
{

    test('Rechaza si minRange no es un numero valido',async()=>
    {

        const req=mockReq({ 
            governmentId: 'CAI-001',
            expirationDate: '2030-01-01',
            range: 
            {

                minRange: 'abc',
                maxRange: 1000,
                expirationDate: '2030-01-01'
                
            }
            
        })
        const res=mockRes()

        await createCai(req,res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({message:'Los rangos deben ser numeros validos'})

    })

    test('Rechaza sin minRange es negativo',async()=>
    {

        const req=mockReq({
            governmentId: 'CAI-001',
            expirationDate: '2030-01-01',
            range: 
            {
                minRange: -1,
                maxRange: 1000,
                expirationDate: '2030-01-01'

            }
        })

        const res=mockRes()

        await createCai(req,res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({message:'Los rangos no pueden ser negativos'})

    })

    test('Rechaza si minRange es mayor que maxRange',async()=>
    {

        const req=mockReq({

            governmentId: 'CAI-001',
            expirationDate: '2030-01-01',
            range: 
            {
                minRange: 5000,
                maxRange: 1000,
                expirationDate: '2030-01-01'
            }

        })
        const res=mockRes()

        await createCai(req,res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({message:'El rango inicial no puede ser mayor al rango final'})

    })

})

// =============================================================================
// TEST 2 — Desactivar rango manualmente (no permitido)
// updateCaiRange solo puede cambiar minRange, maxRange y expirationDate.
// isActive no debe ser modificable desde el body.
// =============================================================================

describe('CaiRange - Desactivar rango manualmente no permitido',()=>
{

    test('Ignorar iActive si viene en el body y no modificarlo',async()=>
    {

        const rangeExistente=
        {

            caiRangeId: 'range-uuid-1',
            caiId: 'cai-uuid-1',
            minRange: 1,
            maxRange: 1000,
            isActive: true,
            update: jest.fn().mockResolvedValue(true)

        }

        CaiRanges.findByPk.mockResolvedValue(rangeExistente)
        Bills.count.mockResolvedValue(0)//sin facturas asociadas


        const req=mockReq(
            {isActive:false,expirationDate:'2030-06-01'},
            {id:'range-uuid-1'}
        )
        const res=mockRes()
        await updateCaiRange(req,res)

        //isActive no debe aparecer en el objeto que se pasa a update
        const dataPassedToUpdate=rangeExistente.update.mock.calls[0][0]
        expect(dataPassedToUpdate).not.toHaveProperty('isActive')

    })

})

// =============================================================================
// TEST 3 — Agregar nuevo rango desactiva todos los anteriores
// Al crear un CaiRange, todos los rangos activos del mismo CAI deben
// quedar isActive: false antes de insertar el nuevo.
// =============================================================================
 
describe('CaiRange - Nuevo rango desactiva todos los anteriores',()=>
{

    test('Llama a CaiRanges.update con isActive:false antes de crear el nuevo',async()=>
    {

        const caiActivo=
        {

            caiId: 'cai-uuid-1',
            isActive: true

        }
        Cais.findByPk.mockResolvedValue(caiActivo)
        CaiRanges.findOne.mockResolvedValue(null)//sin solapamientoo

        const nuevoRango={caiRangeId:'range-uuid-new',minRange:2001,maxRange:3000,isActive:true}
        CaiRanges.create.mockResolvedValue(nuevoRango)
        CaiRanges.update.mockResolvedValue([1])

        const req=mockReq({

            caiId:'cai-uuid-1',
            minRange: 2001,
            maxRange: 3000,
            expirationDate: '2030-01-01'
        
        })
        const res=mockRes()

        await createCaiRange(req,res)

        //aqui se verifica que se desactivaron los rangos anteriores del mismo cai
        expect(CaiRanges.update).toHaveBeenCalledWith(

            {isActive:false},
            expect.objectContaining({where:expect.objectContaining({caiId:'cai-uuid-1',isActive:true})})

        )

        //y que luego se creo el nuevo con isActive:true
        expect(CaiRanges.create).toHaveBeenCalledWith(expect.objectContaining({isActive:true,caiId:'cai-uuid-1'}),expect.anything())

    })

})

// =============================================================================
// TEST 4 — Agregar nuevo rango menor al rango anterior (solapamiento)
// Si el nuevo rango se solapa con uno ya existente, debe rechazarse.
// =============================================================================
describe('CaiRange - Rango menor al anterior se solapa',()=>
{

    test('Rechaza si el nuevo rango cae dentro de un rango existente',async()=>
    {

        const caiActivo=
        {

            caiId: 'cai-uuid-1',
            isActive: true

        }
        Cais.findByPk.mockResolvedValue(caiActivo)

        //aqui se simula que ya existe un rango 1-1000 y el nuevo 500-1500 se solapa
        CaiRanges.findOne.mockResolvedValue({

            caiRangeId: 'range-existente',
            minRange: 1,
            maxRange: 1000

        })  

        const req=mockReq({

            caiId: 'cai-uuid-1',
            minRange: 500,
            maxRange: 1500,
            expirationDate: '2030-01-01'

        })
        const res=mockRes()

        await createCaiRange(req,res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({message:'El rango se solapa con otro rango existente'})


    })

    test('Rechaza si el nuevo rango esta completamente contenido en uno existente',async()=>
    {

        const caiActivo={caiId:'cai-uuid-1',isActive:true}
        Cais.findByPk.mockResolvedValue(caiActivo)

        //nuevo rango 200-500 esta dentro del existe 1-1000
        CaiRanges.findOne.mockResolvedValue({

            caiRangeId: 'range-existente',
            minRange: 1,
            maxRange: 1000

        })

        const req=mockReq({

            caiId: 'cai-uuid-1',
            minRange: 200,
            maxRange: 500,
            expirationDate: '2030-01-01'

        })
        const res=mockRes()

        await createCaiRange(req,res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({message:'El rango se solapa con otro rango existente'})

    })

})

// =============================================================================
// TEST 5 — Agregar mismo rango a 2 CAIs distintos (no permitido)
// La validacion de solapamiento en createCai es global (sin filtrar por caiId),
// por lo que el mismo rango no puede usarse en dos CAIs diferentes.
// =============================================================================

describe('Cai - el mismo rango no puede asignarse a dos Cais distintos',()=>
{

    test('Rechaza crear un cai con un rango ya usado por otro cai',async()=>
    {

        Cais.findOne.mockResolvedValue(null)//govermentId no duplicado

        //simula que otro crais ya tiene el registro 1-1000
        CaiRanges.findOne.mockResolvedValue({

            caiRangeId: 'range-cai-otro',
            minRange: 1,
            maxRange: 1000,
            caiId: 'cai-uuid-otro'

        })

        const req=mockReq({

            governmentId: 'CAI-002',
            expirationDate: '2030-01-01',
            range: 
            {

                minRange: 1,
                maxRange: 1000,
                expirationDate: '2030-01-01'

            }

        })
        const res=mockRes()

        await createCai(req,res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({message:'El rango se solapa con otro rango existente'})

    })

    test('Permite crear un cai si el rango no se solapa con ninguno existente',async()=>
    {

        Cais.findOne.mockResolvedValue(null)
        CaiRanges.findOne.mockResolvedValue(null)

        const caiFake=
        {

            caiId: 'cai-uuid-2',
            governmentId: 'CAI-002',
            isActive: true,
            caiRanges: [{ minRange: 2001, maxRange: 3000, isActive: true }]

        }

        Cais.update.mockResolvedValue([1])
        Cais.create.mockResolvedValue(caiFake)

        const req=mockReq({

            governmentId: 'CAI-002',
            expirationDate: '2030-01-01',
            range: 
            {

                minRange: 2001,
                maxRange: 3000,
                expirationDate: '2030-01-01'

            }

        })
        const res=mockRes()

        await createCai(req,res)

        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'CAI creado correctamente' }))

    })

})