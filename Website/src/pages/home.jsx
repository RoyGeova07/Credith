import { Get,Post,getSession } from '@/helpers/fetcher'
import { useEffect, useState } from 'react'
import MultiSelect from '@/components/multiSelect/multiSelect'
import SubmitDialog from '@/components/dialogs/submitDialog'
import MessageDialog from '@/components/dialogs/messageDialog'
import './home.css'
import{useNavigate}from 'react-router-dom'



export default function Home() 
{

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedOpts, setSelectedOpts] = useState([]);
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

      <SubmitDialog title='Form Dialog' 
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
      </SubmitDialog>

      <MessageDialog title='Message Dialog' 
        openButtonTxt='Message dialog'
        isOpen={isMessageOpen}
        setIsOpen={(o) => setIsMessageOpen(o)}>
        <p> Hola mundo! </p>
      </MessageDialog>
    </>
  )
}

