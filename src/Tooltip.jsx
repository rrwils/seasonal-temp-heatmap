import * as d3 from 'd3';

export const Tooltip = ({ interactionData }) => {
    if (!interactionData) {
      return null;
    }
  
    const { xPos, yPos, name, value , xValue, placement } = interactionData;
  
    return (
      <div
        className="tooltip"
        style={{
          left: xPos,
          top: yPos,
          transform: placement === "left" ? "translate(-130%, -50%)" : "translateY(-50%)",
        }}
      >
        <b>{name}</b>
        <p style={{marginBottom:2, marginTop:2}}>Week {xValue}</p>
        <p style={{marginBottom:2, marginTop:2}}>{d3.format(".1f")(value)}°C</p>
      </div>
    );
  };