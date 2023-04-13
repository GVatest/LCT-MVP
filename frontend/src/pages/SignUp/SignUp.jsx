import { Navigate } from "react-router-dom";
import { useState } from "react";
import AuthForm from "../../components/AuthForm/AuthForm";
import { connect } from 'react-redux'
import { signup } from "../../actions/auth";

const SignUp = ({signup, isAuthenticated, openErrorPopup, isSuperUser}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    name: "",
    username: "",
    password: "",
    password2: "",
    is_superuser: "checked"
  });

  const [is_superuser, setIs_superuser] = useState(false)

  const { fullName, username, password, password2 } = formData;

  const onChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (password !== password2) {
        openErrorPopup("Пароли не совпадают")
    } else {
        signup({fullName, username, password, password2, is_superuser})
    }
  };

  return (
    <div className="auth">
      {isAuthenticated ? (
         <>
         {isSuperUser ? 
           <Navigate to="/users" replace={true} />
         :
           <Navigate to="/study" replace={true} />
         }
         </>
      ) : (
        <AuthForm
          title="Регистрация"
          buttonText="Зарегистрироваться"
          link="/signin"
          linkText="Войти"
          textWithLink="Уже зарегистрированы?"
          onSubmit={onSubmit}
        >
          <div className="auth__item">
            <label className="auth__label">ФИО</label>
            <input
              className="auth__input"
              onChange={(e) => onChange(e)}
              type="text"
              name="fullName"
              value={fullName}
            />
          </div>
          <div className="auth__item">
            <label className="auth__label">Логин</label>
            <input
              className="auth__input"
              onChange={(e) => onChange(e)}
              type="text"
              name="username"
              value={username}
            />
          </div>
          <div className="auth__item">
            <label className="auth__label">Пароль</label>
            <input
              className="auth__input"
              onChange={(e) => onChange(e)}
              type="password"
              name="password"
              value={password}
              minLength="6"
            />
          </div>
          <div className="auth__item">
            <label className="auth__label">Повторите пароль</label>
            <input
              className="auth__input"
              onChange={(e) => onChange(e)}
              type="password"
              name="password2"
              value={password2}
              minLength="6"
            />
          </div>
          <div className="auth__item">
            <label className="auth__label">Суперюзер</label>
            <input
              className="auth__input"
              type="checkbox"
              name="is_superuser"
              onClick={() => {is_superuser ? setIs_superuser(false): setIs_superuser(true)}}
            />
          </div>
        </AuthForm>
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  isSuperUser: state.auth.isSuperUser
})

export default connect(mapStateToProps, {signup})(SignUp)
