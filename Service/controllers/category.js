const{Categories}=require('../models/entities/category')

const createCategory=async(req,res)=>
{

    try
    {

        
        const{name,description}=req.body

        if(!name||name.trim()==='')
        {

            return res.status(400).json({message:'El nombre es requerido'})

        }

        if(!description||description.trim()==='')
        {

            return res.status(400).json({message:'La descripcion es requerida'})

        }

        const categoryExists=await Categories.findOne({where:{name:name.trim().toLowerCase()}})

        if(categoryExists)
        {

            return res.status(400).json({message:'Ya existe una categoria con ese nombre'})

        }

        const category=await Categories.create({name:name.trim().toLowerCase(),description:description.trim()})

        return res.status(201).json({message:'Categoria creada exitosamente',category})

    

    }catch(error){

        return res.status(500).json({message:'Error al crear la categoria',error:error.message})

    }

}

const getCategories=async(req,res)=>
{

    try{

        const categories=await Categories.findAll({order:[['createdAt','DESC']]})

        return res.status(200).json(categories)

    }catch(error){

        return res.status(500).json({message:'Error al listar categorias',error:error.message})

    }

}

const updateCategory=async(req,res)=>
{


    try{

        const{categoryId}=req.params
        const{name,description}=req.body

        const category=await Categories.findByPk(categoryId)

        if(!category)
        {

            return res.status(404).json({message:'Categoria no encontrada'})

        }

        if(!name||name.trim()==='')
        {

            return res.status(400).json({message:'El nombre es requerido'})

        }

        if(!description||description.trim()==='')
        {

            return res.status(400).json({message:'La descripcion es requerida'})

        }

        const categoryExists=await Categories.findOne({where:{name:name.trim().toLowerCase()}})

        if(categoryExists&&categoryExists.categoryId!==category.categoryId)
        {

            return res.status(400).json({message:'Ya existe una categoria con ese nombre'})

        }

        await category.update({name:name.trim().toLowerCase(),description:description.trim()})

        return res.status(200).json({message:'Categoria actualizada correctamente',category})

    }catch(error){


        return res.status(500).json({message:'Error al actualizar la categoria',error:error.message})

    }

}

const activateCategory=async (req, res)=> 
{
    try {

        const { categoryId } = req.params;

        const category=await Categories.findByPk(categoryId);

        if(!category) 
        {

            return res.status(404).json({message: 'Categoría no encontrada'});

        }

        if(category.isActive)
        {

            return res.status(400).json({message:'La categoria ya esta activa'})

        }

        await category.update({isActive: true});

        return res.status(200).json({message: 'Categoría activada correctamente',category});

    }catch(error){

        return res.status(500).json({message: 'Error al activar la categoría',error: error.message});

    }
};

const deactivateCategory=async(req,res)=>
{
    try 
    {

        const { categoryId } = req.params;

        const category=await Categories.findByPk(categoryId);

        if (!category) 
        {

            return res.status(404).json({message: 'Categoría no encontrada'});

        }

        if(!category.isActive)
        {

            return res.status(400).json({message:'La categoria ya esta desactivada'})

        }

        await category.update({isActive: false});

        return res.status(200).json({message: 'Categoría desactivada correctamente',category});

    }catch(error){

        return res.status(500).json({message: 'Error al desactivar la categoría',error: error.message});

    }
};

module.exports={createCategory,getCategories,updateCategory,activateCategory,deactivateCategory};
