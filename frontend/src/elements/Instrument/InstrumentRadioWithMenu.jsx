import InstrumentRadio from "./InstrumentRadio";

function InstrumentRadioWithMenu({ img, alt, onClick, disabled, setIsOpen, isOpen, children, isActive, idRadio }) {

    function onCloseMenu(e) {
        if (!e.target.className.includes("instrument-context__menu")) {
            setIsOpen(false);
            window.removeEventListener("click", onCloseMenu);
        }
    }

    function handleContextMenu(e) {
        e.preventDefault();
        setIsOpen(true);
        window.addEventListener("click", onCloseMenu);
    }

    return (
        <div className="instrument-context" onContextMenu={handleContextMenu}>
            <InstrumentRadio idRadio={idRadio} img={img} alt={alt} onClick={onClick} disabled={disabled} />
            
            <div className={`instrument-context__menu ${isOpen ? "instrument-context__menu_opened" : ""}`}>
                {children}
            </div>
        </div>
    );
}

export default InstrumentRadioWithMenu;
