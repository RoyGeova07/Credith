import { Get,Post,getSession } from '@/helpers/fetcher'
import { useEffect, useState } from 'react'
import MultiSelect from '@/components/multiSelect/MultiSelect'
import FormDialog from '@/components/dialogs/SubmitDialog'
import Dialog from '@/components/dialogs/Dialog'
import './Home.css'
import{useNavigate}from 'react-router-dom'
import MultiSelectTransfer from '@/components/multiSelect/MultiSelectTransfer'



export default function Home() 
{

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedOpts, setSelectedOpts] = useState([]);
  const[seletedRoles,setSelectedRoles]=useState([])//NUEVO
  const [testStr, setTestStr] = useState(null)
  const [isOpen, setIsOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const navigate=useNavigate();
  const[currentUser]=useState(()=>getSession())
  const onLoad = async (search, loadedOptions, { page }) => {
      return {
          options: [
            {
                value: 'Test val #1',
                label: 'Test val #1'
            },
            {
                value: 'Test val #2',
                label: 'Test val #2'
            },
            {
                value: 'Test val #3',
                label: 'Test val #3'
            },
          ],
          hasMore: false,
          page: page + 1
      }
  }

  {/**==NUEVO== */}
  const loadRoles=async({page,limit})=>
  {

    const data=[
        { id: 1, name: "Admin" },
        { id: 2, name: "Employee" },
        { id: 3, name: "Owner" },
        { id: 4, name: "Supervisor" },
        { id: 5, name: "Manager" },
        { id: 6, name: "LIONEL" },
        { id: 7, name: "ROY" },
        { id: 8, name: "LIGNLRNLE" },
        { id: 9, name: "ERICK" },
        { id: 10, name: "CARLOS" },
        { id: 11, name: "REOY" },
        { id: 12, name: "OIENOENGOINERONE" }
    ];
    {/**==NUEVO== */}

    const inicio=(page-1)*limit
    const fin=inicio+limit
    return {
        items: data.slice(inicio,fin),
        total: data.length
    };

  }

  const onSelect = (list) => {
      console.log(list);
      setSelectedOpts(list);
  }

  const onAccept = () => {
      alert(`Email: ${email} | password: ${password}`);
      console.log("== submitted list ==");
      console.log(selectedOpts);
      setEmail('');
      setPassword('');
      setSelectedOpts([])
      setIsOpen(false);
  }

  const handleLogout=async()=>
  {

    await Post('/api/users/logout')//limpia ambas cookies desde el servidor    

    navigate('/login');

  };

  useEffect(() => {
    Get('/').then((out) => setTestStr(out.json.message))
  }, [])

  return (
    <>

      <div className="user-banner">

        <span>

          {

            currentUser? `Bienvenido, ${currentUser.first_name} ${currentUser.first_last_name}`:'ENTRADA DEL MERO MERO XD'
            

          }

        </span>

        {

          currentUser&&
          (
            
            <button

              className="logout-btn"
              onClick={handleLogout}

            >

              Cerrar sesión

            </button>

          )

        }

      </div>

      <button className='open-btn'
            onClick={() => setIsOpen(true)}>
        Form Dialog
      </button>
      <button className='open-btn'
            onClick={() => setIsMessageOpen(true)}>
        Dialog Message
      </button>

      <FormDialog title='Form Dialog' 
        isOpen={isOpen}
        openButtonTxt='Form dialog'
        onClose={() => setIsOpen(false)}
        onAccept={onAccept}
        setIsOpen={(o) => setIsOpen(o)}>
        <form>
            <MultiSelect
                    title='This is a test multi-select'
                    selected={selectedOpts}
                    onSelect={onSelect}
                    onLoad={onLoad}
                />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </form>
      </FormDialog>

      <Dialog title='Message Dialog' 
        openButtonTxt='Message dialog'
        isOpen={isMessageOpen}
        setIsOpen={(o) => setIsMessageOpen(o)}>
        <p> Hola mundo! </p>
      </Dialog>

      {/**==NUEVO== */}
      <h2>Prueba MultiSelectTransfer</h2>

      <MultiSelectTransfer
      
        LoadData={loadRoles}
        SelectedList={seletedRoles}
        onChange={setSelectedRoles}
      
      />

      <h3>Seleccionados: </h3>

      <pre>

        {JSON.stringify(seletedRoles,null,2)}

      </pre>
      {/**==NUEVO== */}

    </>
  )
}

