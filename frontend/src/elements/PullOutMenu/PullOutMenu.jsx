import "./PullOutMenu.css";

function PullOutMenu({ wcCallback, wwCallback, baseWindowingCallback }) {
  return (
    <div className="pull-out-menu">
      <ul className="pull-out-menu__list">
        <li className="pull-out-menu__item">
          <label className="pull-out-menu__label">Window Center</label>
          <input id="windowCenter"
            className="pull-out-menu__input"
            type="number"
            name="center"
            min="-50000"
            max="50000"
            defaultValue="0"
            onChange={wcCallback}
          />
        </li>
        <li className="pull-out-menu__item">
          <label className="pull-out-menu__label">Window Width</label>
          <input id="windowWidth"
            className="pull-out-menu__input"
            type="number"
            name="width"
            min="-50000"
            max="50000"
            defaultValue="50000"
            onChange={wwCallback}
          />
        </li>
        <li className="pull-out-menu__item">
          <select
            className="pull-out-menu__select"
            name="base"
            onChange={baseWindowingCallback}
            defaultValue="Базовые значения"
          >
            <option value="Базовые значения"> Базовые значения </option>
            <option value="Полная динамика"> Полная динамика </option>
            <option value="Мозг">Мозг</option>
            <option value="Лёгкие">Лёгкие</option>
            <option value="Печень">Печень</option>
            <option value="Кости">Кости</option>
          </select>
        </li>
      </ul>
    </div>
  );
}

export default PullOutMenu;
