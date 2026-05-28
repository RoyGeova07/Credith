// import { Get } from '@/helpers/fetcher'
// import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import MultiSelect from './components/multiSelect/multiSelect'
// import SubmitDialog from './components/dialogs/submitDialog'
// import MessageDialog from './components/dialogs/messageDialog'
import './App.css'
import RegisterPage from './pages/RegisterPage'


export default function App() {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [selectedOpts, setSelectedOpts] = useState([]);
  // const [testStr, setTestStr] = useState(null)
  // const [isOpen, setIsOpen] = useState(false);
  // const [isMessageOpen, setIsMessageOpen] = useState(false);
  // const [count, setCount] = useState(0)

  return <RegisterPage/>

  // const onLoad = async (search, loadedOptions, { page }) => {
  //     return {
  //         options: [
  //           {
  //               value: 'Test val #1',
  //               label: 'Test val #1'
  //           },
  //           {
  //               value: 'Test val #2',
  //               label: 'Test val #2'
  //           },
  //           {
  //               value: 'Test val #3',
  //               label: 'Test val #3'
  //           },
  //         ],
  //         hasMore: false,
  //         page: page + 1
  //     }
  // }

  // const onSelect = (list) => {
  //     console.log(list);
  //     setSelectedOpts(list);
  // }

  // const onAccept = () => {
  //     alert(`Email: ${email} | password: ${password}`);
  //     console.log("== submitted list ==");
  //     console.log(selectedOpts);
  //     setEmail('');
  //     setPassword('');
  //     setSelectedOpts([])
  //     setIsOpen(false);
  // }

  // useEffect(() => {
  //   Get('/').then((out) => setTestStr(out.json.message))
  // }, [])

  // return (
  //   <>
  //     <SubmitDialog title='Form Dialog' 
  //       isOpen={isOpen}
  //       openButtonTxt='Form dialog'
  //       onClose={() => setIsOpen(false)}
  //       onAccept={onAccept}
  //       setIsOpen={(o) => setIsOpen(o)}>
  //       <form>
  //           <MultiSelect
  //                   title='This is a test multi-select'
  //                   selected={selectedOpts}
  //                   onSelect={onSelect}
  //                   onLoad={onLoad}
  //               />
  //         <input
  //           value={email}
  //           onChange={(e) => setEmail(e.target.value)}
  //           placeholder="Email"
  //         />

  //         <input
  //           type="password"
  //           value={password}
  //           onChange={(e) => setPassword(e.target.value)}
  //           placeholder="Password"
  //         />
  //       </form>
  //     </SubmitDialog>

  //     <MessageDialog title='Form Dialog' 
  //       openButtonTxt='Message dialog'
  //       isOpen={isMessageOpen}
  //       setIsOpen={(o) => setIsMessageOpen(o)}>
  //       <p> Hola mundo! </p>
  //     </MessageDialog>

  //     <section id="center">
  //       <div className="hero">
  //         <img src={heroImg} className="base" width="170" height="179" alt="" />
  //         <img src={reactLogo} className="framework" alt="React logo" />
  //         <img src={viteLogo} className="vite" alt="Vite logo" />
  //       </div>
  //       <div>
  //         <h1>{ testStr }</h1>
  //         <p>
  //           Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
  //         </p>
  //       </div>
  //       <button
  //         type="button"
  //         className="counter"
  //         onClick={() => setCount((count) => count + 1)}
  //       >
  //         Count is {count}
  //       </button>
  //     </section>

  //     <div className="ticks"></div>

  //     <section id="next-steps">
  //       <div id="docs">
  //         <svg className="icon" role="presentation" aria-hidden="true">
  //           <use href="/icons.svg#documentation-icon"></use>
  //         </svg>
  //         <h2>Documentation</h2>
  //         <p>Your questions, answered</p>
  //         <ul>
  //           <li>
  //             <a href="https://vite.dev/" target="_blank">
  //               <img className="logo" src={viteLogo} alt="" />
  //               Explore Vite
  //             </a>
  //           </li>
  //           <li>
  //             <a href="https://react.dev/" target="_blank">
  //               <img className="button-icon" src={reactLogo} alt="" />
  //               Learn more
  //             </a>
  //           </li>
  //         </ul>
  //       </div>
  //       <div id="social">
  //         <svg className="icon" role="presentation" aria-hidden="true">
  //           <use href="/icons.svg#social-icon"></use>
  //         </svg>
  //         <h2>Connect with us</h2>
  //         <p>Join the Vite community</p>
  //         <ul>
  //           <li>
  //             <a href="https://github.com/vitejs/vite" target="_blank">
  //               <svg
  //                 className="button-icon"
  //                 role="presentation"
  //                 aria-hidden="true"
  //               >
  //                 <use href="/icons.svg#github-icon"></use>
  //               </svg>
  //               GitHub
  //             </a>
  //           </li>
  //           <li>
  //             <a href="https://chat.vite.dev/" target="_blank">
  //               <svg
  //                 className="button-icon"
  //                 role="presentation"
  //                 aria-hidden="true"
  //               >
  //                 <use href="/icons.svg#discord-icon"></use>
  //               </svg>
  //               Discord
  //             </a>
  //           </li>
  //           <li>
  //             <a href="https://x.com/vite_js" target="_blank">
  //               <svg
  //                 className="button-icon"
  //                 role="presentation"
  //                 aria-hidden="true"
  //               >
  //                 <use href="/icons.svg#x-icon"></use>
  //               </svg>
  //               X.com
  //             </a>
  //           </li>
  //           <li>
  //             <a href="https://bsky.app/profile/vite.dev" target="_blank">
  //               <svg
  //                 className="button-icon"
  //                 role="presentation"
  //                 aria-hidden="true"
  //               >
  //                 <use href="/icons.svg#bluesky-icon"></use>
  //               </svg>
  //               Bluesky
  //             </a>
  //           </li>
  //         </ul>
  //       </div>
  //     </section>

  //     <div className="ticks"></div>
  //     <section id="spacer"></section>
  //   </>
  // )
}
