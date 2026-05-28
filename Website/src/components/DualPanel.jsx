import'./DualPanel.css'

export default function DualPanel({left,right})
{

    return(

        <div className="dual-panel">

            <div className="left-panel">

                {left}

            </div>

            <div className="right-panel">

                {right}

            </div>

        </div>

        

    )

}