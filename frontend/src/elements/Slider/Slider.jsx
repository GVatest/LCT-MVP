import { useEffect } from "react";
import "./Slider.css";

function Slider({ nextImage, prevImage, array, current_idx, updateIdx, idName }) {
  useEffect(() => {
    console.log('array', array);
  }, []);
  return (
    <div className="slider" id={idName}>
      <button
        className="slider__btn slider__btn_name_next"
        type="button"
        onClick={nextImage}
      ></button>

      <ul className="slider__list">
      {array.map((value, i) => {
        if (current_idx == i) {
          return (
            <li className="slider__item slider__item_active" key={i} onClick={() => updateIdx(i, 'axial')}></li>
          );
        } 
        if(value === 0) {
          return (
            <li className="slider__item" key={i} onClick={() => updateIdx(i, 'axial')}></li>
          );
        }
        if(value === 1) {
          return (
            <li className="slider__item slider__item_type_marked" key={i} onClick={() => updateIdx(i, 'axial')}></li>
          );
        }
      })}
      </ul>

      <button
        className="slider__btn slider__btn_name_prev"
        type="button"
        onClick={prevImage}
      ></button>

      <p className="slider__name">Название слайда</p>
    </div>
  );
}

export default Slider;
