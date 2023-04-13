import "./Instruments.css";

function InstrumentRadio({ img, alt, onClick, disabled, idRadio }) {
  function handleContextMenu(e) {
    e.preventDefault();
  }

  function handleClick() {
    if (disabled) {
        return;
    }
    onClick();
  }

  return (
    <>
        <input type="radio" name="instruments" className="instruments__radio-input" id={idRadio} disabled={disabled} />
        <label
        className="instrument instruments__radio-label"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        for={idRadio}
        disabled={disabled}
        >
        <img src={img} alt={alt} className="instrument__img" />
        <span className="instrument__info">{alt}</span>
        </label>
    </>
  );
}

export default InstrumentRadio;
