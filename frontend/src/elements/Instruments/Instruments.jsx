import Instrument from "../Instrument/Instrument";
import InstrumentWithMenu from "../Instrument/InstrumentWithMenu";
import InstrumentRadio from "../Instrument/InstrumentRadio";
import InstrumentRadioWithMenu from "../Instrument/InstrumentRadioWithMenu";
import cursor from "../../assets/images/instruments/cursor.svg";
import shift from "../../assets/images/instruments/shift.svg";
import x from "../../assets/images/instruments/x.svg";
import antiBrush from "../../assets/images/instruments/anti-brush.svg";
import eraser from "../../assets/images/instruments/eraser.svg";
import polygon from "../../assets/images/instruments/polygon.svg";
import point from "../../assets/images/instruments/point.svg";
import ruler from "../../assets/images/instruments/ruler.svg";
import circle from "../../assets/images/instruments/circle.svg";
import filling2D from "../../assets/images/instruments/filling2D.svg";
import fillingValue from "../../assets/images/instruments/filling-value.svg";
import filling from "../../assets/images/instruments/filling.svg";
import { useState } from "react";

function Instruments({ callbacks, changes}) {
  const [isOpenSizeMenu, setIsOpenSizeMenu] = useState(false);
  const [isOpenRoiMenu, setIsOpenRoiMenu] = useState(false);
  const [isOpenEraserMenu, setIsOpenEraserMenu] = useState(false);
  const [isOpenDeviationMenu, setIsOpenDeviationMenu] = useState(false);
  const [isActiveFilling2D, setIsActiveFilling2D] = useState(false);
  const [isActiveContoursFilling, setIsActiveContoursFilling] = useState(false);
  const [isActiveThresholdFill, setIsActiveThresholdFill] = useState(false);
  const [isOpenViewsMenu, setIsOpenViewsMenu] = useState(false);

  function onClickFilling2D() {
    setIsActiveFilling2D(!isActiveFilling2D);
    callbacks['FloodFillTool']();

  }

  function onClickFilling() {
    setIsActiveContoursFilling(!isActiveContoursFilling);
    callbacks["ContoursFillTool"]();
  }

  function onClickThresholdFilling() {
    setIsActiveThresholdFill(!isActiveThresholdFill);
    callbacks["ThresholdFillTool"]();
  }

  return (
    <div className="instruments">
      <ul className="instruments__list">
        {/* Основные инструменты */}
        <li className="instruments__item instruments__item_name_radio">
          <InstrumentRadio
            idRadio="cursor"
            img={cursor}
            alt="Курсор"
            onClick={callbacks["PointerTool"]}
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_name_radio">
          <InstrumentRadio
            idRadio="shift"
            img={shift}
            alt="Перемещение"
            onClick={callbacks["MoveTool"]}
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Инструменты ручной разметки */}
        <li className="instruments__item instruments__item_name_radio">
          <InstrumentRadioWithMenu
            idRadio="brush"
            img={antiBrush}
            alt="Кисть"
            onClick={callbacks["BrushTool"]}
            disabled={false}
            setIsOpen={setIsOpenSizeMenu}
            isOpen={isOpenSizeMenu}
          >
            <label className="instrument-context__menu-label">
              Размер
            </label>
            <input
              className="instrument-context__menu-input"
              type="range"
              min="1"
              max="20"
              name="brushSize"
              defaultValue="5"
              onChange={changes["brushSize"]}
            />
          </InstrumentRadioWithMenu>
        </li>
        {/* <li className="instruments__item instruments__item_name_radio">
          <InstrumentRadio
            idRadio="antiBrush"
            img={brush}
            alt="Анти&#8209;кисть"
            onClick={callbacks["AntiBrushTool"]}
            disabled={true}
          />
        </li> */}
        <li className="instruments__item instruments__item_name_radio">
          <InstrumentRadioWithMenu
            idRadio="eraser"
            img={eraser}
            alt="Ластик"
            onClick={callbacks["EraserTool"]}
            disabled={false}
            setIsOpen={setIsOpenEraserMenu}
            isOpen={isOpenEraserMenu}
          >
            <label className="instrument-context__menu-label">
              Размер
            </label>
            <input
              className="instrument-context__menu-input"
              type="range"
              min="1"
              max="20"
              name="eraserSize"
              defaultValue="5"
              onChange={changes["brushSize"]}
            />
          </InstrumentRadioWithMenu>
        </li>
        <li className="instruments__item instruments__item_name_radio">
          <InstrumentRadio
            idRadio="polygon"
            img={polygon}
            alt="Построение полигонов"
            onClick={callbacks["PolygonTool"]}
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_name_radio">
          <InstrumentRadio
            idRadio="point"
            img={point}
            alt="Точки"
            onClick={callbacks["PointTool"]}
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Измерительные инструменты */}
        <li className="instruments__item instruments__item_name_radio">
          <InstrumentRadio
            idRadio="ruler"
            img={ruler}
            alt="Линейка"
            onClick={callbacks["RulerTool"]}
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_name_radio">
          <InstrumentRadioWithMenu
            idRadio="circle"
            img={circle}
            alt="ROI"
            onClick={callbacks["ROI"]}
            disabled={false}
            setIsOpen={setIsOpenRoiMenu}
            isOpen={isOpenRoiMenu}
          >
            <label className="instrument-context__menu-label">
              Размер
            </label>
            <input
              className="instrument-context__menu-input"
              type="range"
              min="1"
              max="20"
              name="RoiSize"
              defaultValue="5"
              onChange={changes["RoiSize"]}
            />
          </InstrumentRadioWithMenu>
        </li>
        <li className="instruments__item instruments__item_type_line"></li>

        {/* Инструменты полу-автоматической разметки */}
        <li
          className={`instruments__item ${
            isActiveFilling2D && "instruments__item_active"
          }`}
          onClick={onClickFilling2D}
        >
          <div className="instruments__label">
            <InstrumentWithMenu
              img={filling2D}
              alt="Заливка 2D"
              disabled={false}
              setIsOpen={setIsOpenDeviationMenu}
              isOpen={isOpenDeviationMenu}
            >
              <label className="instrument-context__menu-label">
                Интенсивность заливки
              </label>
              <input
                className="instrument-context__menu-input"
                type="number"
                min="0"
                max="25"
                name="deviationAmount"
                defaultValue="5"
                onChange={changes["tolerance"]}
              />
            </InstrumentWithMenu>
          </div>
        </li>
        {/* <li className="instruments__item">
          <Instrument
            img={filling3D}
            alt="Заливка 3D"
            onClick={callbacks["FloodFill3Tool"]}
            disabled={true}
          />
        </li> */}
        <li 
          className={`instruments__item ${
            isActiveThresholdFill && "instruments__item_active"
          }`}
          onClick={onClickThresholdFilling}
        >
          <InstrumentWithMenu
            img={fillingValue}
            alt="Заливка по значениям"
            disabled={false}
            setIsOpen={setIsOpenViewsMenu}
            isOpen={isOpenViewsMenu}
          >
            <ul className="instrument-context__menu-list">
            <li className="instrument-context__menu-item">
                <label className="instrument-context__menu-label">Нижнее</label>
                <input
                  className="instrument-context__menu-input"
                  type="number"
                  min="-10000"
                  max="40000"
                  name="bottomValue"
                  defaultValue="-100"
                  onChange={changes["bottomValue"]}
                />
              </li>
              <li className="instrument-context__menu-item">
                <label className="instrument-context__menu-label">
                  Верхнее
                </label>
                <input
                  className="instrument-context__menu-input"
                  type="number"
                  min="-10000"
                  max="40000"
                  name="topValue"
                  defaultValue="300"
                  onChange={changes["topValue"]}
                />
              </li>
            </ul>
          </InstrumentWithMenu>
        </li>
        <li 
          className={`instruments__item ${
            isActiveContoursFilling && "instruments__item_active"
          }`}
          onClick={onClickFilling}
        >
          <Instrument
            img={filling}
            alt="Заливка контуров"
            disabled={false}
          />
        </li>
        <li className="instruments__item instruments__item_type_line"></li>
        <li className="instruments__item instruments__item_name_radio">
          <Instrument
            idRadio="clear"
            img={x}
            alt="Очистить"
            onClick={callbacks["clear"]}
            disabled={false}
          />
        </li>
      </ul>
    </div>
  );
};

export default Instruments;
