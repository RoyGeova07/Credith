export const Directions = {
    HORIZONTAL: 'row',
    VERTICAL: 'column',
}

export function StackDiv({
    direction = Directions.VERTICAL,
    gap,
    padding = '5px',
    margin = '5px',
    bgColor = 'inherit',
    children
}) {
    return (
        <>
            <div style={{
                backgroundColor: bgColor,
                gap: gap,
                display: 'flex',
                flex: 1,
                padding: padding,
                margin: margin,
                flexDirection: direction
            }}>
                {children}
            </div>
        </>
    )
}
