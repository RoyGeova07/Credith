import { useRef } from 'react'
import './DniInput.css'

export default function DniInput({ value, onChange, onKeyDown }) {
    const ref1 = useRef(null)
    const ref2 = useRef(null)
    const ref3 = useRef(null)

    const seg1 = value.slice(0, 4)
    const seg2 = value.slice(4, 8)
    const seg3 = value.slice(8, 13)

    function updateSeg(segIdx, raw) {
        const digits = raw.replace(/\D/g, '')
        if (segIdx === 0) {
            const clamped = digits.slice(0, 4)
            onChange(clamped + seg2 + seg3)
            if (clamped.length === 4) ref2.current?.focus()
        } else if (segIdx === 1) {
            const clamped = digits.slice(0, 4)
            onChange(seg1 + clamped + seg3)
            if (clamped.length === 4) ref3.current?.focus()
        } else {
            onChange(seg1 + seg2 + digits.slice(0, 5))
        }
    }

    function handleKeyDown(e, prevRef) {
        if (e.key === 'Backspace' && e.target.value === '') {
            prevRef?.current?.focus()
        }
        onKeyDown?.(e)
    }

    function handleContainerClick(e) {
        if (e.target.tagName !== 'INPUT') {
            if (seg1.length < 4) ref1.current?.focus()
            else if (seg2.length < 4) ref2.current?.focus()
            else ref3.current?.focus()
        }
    }

    return (
        <div className="dni-input-segments" onClick={handleContainerClick}>
            <input ref={ref1} type="text" inputMode="numeric" maxLength={4} className="dni-input-seg"
                value={seg1} onChange={e => updateSeg(0, e.target.value)} onKeyDown={e => handleKeyDown(e, null)} />
            <span className="dni-input-sep">–</span>
            <input ref={ref2} type="text" inputMode="numeric" maxLength={4} className="dni-input-seg"
                value={seg2} onChange={e => updateSeg(1, e.target.value)} onKeyDown={e => handleKeyDown(e, ref1)} />
            <span className="dni-input-sep">–</span>
            <input ref={ref3} type="text" inputMode="numeric" maxLength={5} className="dni-input-seg dni-input-seg--last"
                value={seg3} onChange={e => updateSeg(2, e.target.value)} onKeyDown={e => handleKeyDown(e, ref2)} />
        </div>
    )
}
