import "./BrandPanel.css";

export default function BrandPanel({description='Únete a nuestra red de inversiones y forma parte de una comunidad que crece contigo. Gestiona tus créditos e inversiones con total confianza.'})
{
       
  return(

        <div className="brand-panel">

            <div className="brand-logo-area">

                <div className="brand-inversiones">Inversiones</div>

                <div className="brand-house-icon">

                    <svg viewBox="0 0 96 90" fill="none" xmlns="http://www.w3.org/2000/svg">

                        <polygon points="48,4 88,42 8,42" fill="none" stroke="url(#roofGrad)" strokeWidth="7" strokeLinejoin="round"/>

                        <rect x="14" y="42" width="68" height="42" rx="2" fill="none" stroke="url(#bodyGrad)" strokeWidth="6"/>

                        <rect x="38" y="56" width="20" height="28" rx="3" fill="#c0392b"/>

                        <path d="M4 72 Q24 62 48 72 Q72 82 92 72" stroke="url(#waveGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>

                        <defs>

                            <linearGradient id="roofGrad" x1="8" y1="4" x2="88" y2="42" gradientUnits="userSpaceOnUse">

                                <stop stopColor="#2ecc71"/><stop offset="1" stopColor="#1a7a3c"/>

                            </linearGradient>


                            <linearGradient id="bodyGrad" x1="14" y1="42" x2="82" y2="84" gradientUnits="userSpaceOnUse">


                                <stop stopColor="#00b3a4"/><stop offset="1" stopColor="#2980b9"/>

                            </linearGradient>


                            <linearGradient id="waveGrad" x1="4" y1="72" x2="92" y2="72" gradientUnits="userSpaceOnUse">

                                <stop stopColor="#2980b9"/><stop offset="0.6" stopColor="#5dade2"/><stop offset="1" stopColor="#c9a227"/>

                            </linearGradient>

                        </defs>

                    </svg>

                </div>

                <div className="brand-name">Servi<span>Credith</span></div>

                <div className="brand-tagline">Creciendo Juntos</div>

            </div>

            <div className="brand-divider" />


            <p className="brand-description">

                {description}

            </p>

            <div className="wave-bar" />

        </div>

    );
  
}