import "./Header.css";
import { useLocation } from "react-router-dom";
import Navigation from "../../components/Navigation/Navigation";
import { logout } from "../../actions/auth";
import { connect } from 'react-redux'
import axios from "axios";
import { BASE_URL } from "../../constans";
import { useState } from "react";
import logo from "../../assets/images/logo.png";

const Header = ({logout, isSuperUser}) => {
  const { pathname } = useLocation();
  const [userId, setUserId] = useState(0)

  if (
    pathname !== "/" &&
    !pathname.includes("/users") &&
    !pathname.includes("/dashboard") &&
    !pathname.includes("/study") &&
    pathname !== "/generation"
  ) {
    return <></>;
  }

  const logoutHendler = () => {
    window.location = "/signin"
    logout()
  }

  const getUserUniqueId = () => {
    const config = {
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    }
    return axios.get(BASE_URL + "api/" + 'user/unique_id/', config)
  }

  const givePermissions = (e) => {
    if (!userId) {
      getUserUniqueId()
      .then((response) => {
        setUserId(response.data["unique_id"])
      })
    } else {
      navigator.clipboard.writeText(e.target.innerText)
    }
  }

  return (
    <header className="header">
      <img className="header__logo" src={logo} />

      <Navigation isSuperUser={isSuperUser} />

      <div className="header__account">
        {!isSuperUser &&
          <button onClick={!userId ? givePermissions : navigator.clipboard.writeText(window.location.protocol + "//" + window.location.host + '/user/' + userId)} type="button" className="header__link">
            {!userId ? "Предоставить доступ" : window.location.protocol + "//" + window.location.host + '/user/' + userId}
          </button>
        }
        <button onClick={logoutHendler} type="button" className="header__button">
          Выйти
        </button>
      </div>
    </header>
  );
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  isSuperUser: state.auth.isSuperUser
})

export default connect(mapStateToProps, {logout})(Header)
