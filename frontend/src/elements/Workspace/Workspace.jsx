import "./Workspace.css";
import Instrument from "../Instrument/Instrument";
import Slider from "../Slider/Slider";
import squere4 from "../../assets/images/instruments/squere4.svg";
import squere from "../../assets/images/instruments/squere.svg";
import { useEffect } from "react";

function Workspace({
  fourImage,
  changeView,
  mouseCallback,
  nextAxial,
  prevAxial,
  nextSaggital,
  prevSaggital,
  nextCoronal,
  prevCoronal,
  axialStat,
  saggitalStat,
  coronalStat,
  axial_idx,
  saggital_idx,
  coronal_idx,
  updateIdx
}) {
  useEffect(() => {
    console.log('axialStat', axialStat);
  }, []);
  return (
    <div className="workspace">
      {fourImage ? (
        <Instrument img={squere} alt="Вид" onClick={changeView} />
      ) : (
        <Instrument img={squere4} alt="Вид" onClick={changeView} />
      )}

      <div
        className={`workspace__img ${
          fourImage ? "workspace__img_type_four" : ""
        }`}
      >
        {fourImage ? (
          <>
            <div className="workspace__img-container">
              <canvas
                className="workspace__one-im-annotate"
                id="axial"
                onMouseDownCapture={mouseCallback}
                onMouseUpCapture={mouseCallback}
                onMouseMove={mouseCallback}
              ></canvas>
              <Slider nextImage={nextAxial} prevImage={prevAxial} array={axialStat} current_idx={axial_idx} updateIdx={updateIdx} idName="scrollAxial"/>
            </div>
            <div className="workspace__img-container">
            <canvas
                className="workspace__one-img"
                id="clear_axial"
                onMouseDownCapture={mouseCallback}
                onMouseUpCapture={mouseCallback}
                onMouseMove={mouseCallback}
              ></canvas>
              <Slider nextImage={nextAxial} prevImage={prevAxial} array={axialStat} current_idx={axial_idx} updateIdx={updateIdx} idName="scrollAxialClear"/>
            </div>
            <div className="workspace__img-container">
            <canvas
                className="workspace__one-img"
                id="saggital"
                onMouseDownCapture={mouseCallback}
                onMouseUpCapture={mouseCallback}
                onMouseMove={mouseCallback}
              ></canvas>
              <Slider nextImage={nextSaggital} prevImage={prevSaggital} array={saggitalStat} current_idx={saggital_idx} updateIdx={updateIdx} idName="scrollSaggital"/>
            </div>
            <div className="workspace__img-container">
            <canvas
                className="workspace__one-img"
                id="coronal"
                onMouseDownCapture={mouseCallback}
                onMouseUpCapture={mouseCallback}
                onMouseMove={mouseCallback}
              ></canvas>
              <Slider nextImage={nextCoronal} prevImage={prevCoronal} array={coronalStat} current_idx={coronal_idx} updateIdx={updateIdx} idName="scrollCoronal"/>
            </div>
          </>
        ) : (
          <div className="workspace__img-container">
            <canvas
              className="workspace__one-im-annotate"
              id="axial"
              onMouseDownCapture={mouseCallback}
              onMouseUpCapture={mouseCallback}
              onMouseMove={mouseCallback}
            ></canvas>
            <Slider nextImage={nextAxial} prevImage={prevAxial} array={axialStat} current_idx={axial_idx} updateIdx={updateIdx} idName="scrollAxial" />
          </div>
        )}
      </div>
    </div>
  );
}

export default Workspace;
