import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import Dashboard from "./pages/Dashboard/Dashboard";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import UsersList from "./pages/UsersList/UsersList";
import Study from "./pages/Study/Study";
import Generation from "./pages/Generation/Generation";
import FileManager from "./elements/FileUpload";
import Marker from "./components/Marker";
import Header from "./components/Header/Header";
import PopupInfo from "./elements/Popup/PopupInfo";
import Preloader from "./components/Preloader/Preloader";
import { useState, useEffect } from "react";
import studiesApi from "./utils/StudiesApi";
import EditPopup from "./components/EditPopup/EditPopup";
import DeletePopup from "./components/DeletePopup/DeletePopup";
import AddPopup from "./components/AddPopup/AddPopup";
import JSZip from "jszip";
import { refreshToken } from "./actions/auth";
import { connect } from "react-redux";
import Permission from "./components/Permission/Permissions";
import { BASE_URL } from "./constans";

const App = ({ token, refresh, isSuperUser, refreshToken }) => {
  const [isOpenEditPopup, setIsOpenEditPopup] = useState(false); //Попап редактирования исследования
  const [isOpenDeletePopup, setIsOpenDeletePopup] = useState(false); //Попап удаления исследования
  const [isOpenAddPopup, setIsOpenAddPopup] = useState(false); //Попап добавления исследования
  const [isOpenErrorPopup, setIsOpenErrorPopup] = useState(false); //Попап ошибки
  const [infoText, setInfoText] = useState("");

  const [isGenerated, setIsGenerated] = useState(false); //Сгенерированы ли патологии

  const [isLoading, setIsLoading] = useState(false); //Прелоадер

  const [studies, setStudies] = useState([]); // Все исследования
  const [study, setStudy] = useState({}); // Исследование
  const [users, setUsers] = useState([]); // Все врачи

  const checkToken = () => {
    if (refresh !== null && token !== null) {
      try {
        refreshToken(refresh);
      } catch (e) {
        window.location = "/signin";
      }
    } else if (window.location.pathname !== "/signin") {
      window.location = "/signin";
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  function getStudies() {
    setIsLoading(true);

    studiesApi
      .getAllStudies()
      .then((res) => {
        setStudies(res);
      })
      .catch((err) => {
        openErrorPopup(err.response.data["error"]);
      })
      .finally(setIsLoading(false));
  }

  function getUsers() {
    setIsLoading(true);

    studiesApi
      .getAllUsers()
      .then((res) => {
        setUsers(res);
      })
      .catch((err) => {
        openErrorPopup(err.response.data["error"]);
      })
      .finally(setIsLoading(false));
  }

  function closeAllPopups() {
    setIsOpenEditPopup(false);
    setIsOpenDeletePopup(false);
    setIsOpenAddPopup(false);
    setIsOpenErrorPopup(false);
  }

  function openEditPopup(study) {
    setStudy(study);
    setIsOpenEditPopup(true);
  }

  function openDeletePopup(study) {
    setStudy(study);
    setIsOpenDeletePopup(true);
  }

  function openAddPopup() {
    setIsOpenAddPopup(true);
  }

  function openErrorPopup(errorText) {
    setInfoText(errorText);
    setIsOpenErrorPopup(true);
  }

  function editStudy(id, newComment, state) {
    setIsLoading(true);

    studiesApi
      .editStudy(id, {
        comment: newComment,
        state: state,
      })
      .then((res) => {
        location.reload();
        closeAllPopups();
      })
      .catch((err) => {
        closeAllPopups();
        openErrorPopup(err.response.data["error"]);
      })
      .finally(setIsLoading(false));
  }

  function deleteStudy(id) {
    setIsLoading(true);

    studiesApi
      .deleteStudy(id)
      .then((res) => {
        setStudies(studies.filter((study) => study.unique_id !== id));
        closeAllPopups();
      })
      .catch((err) => {
        closeAllPopups();
        openErrorPopup(err.response.data["error"]);
      })
      .finally(setIsLoading(false));
  }

  function addStudy(newStudy) {
    setIsLoading(true);

    studiesApi
      .addNewStudy(newStudy)
      .then((res) => {
        setStudies([...studies, res.data]);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        openErrorPopup(err.response.data["error"]);
      })
      .finally(closeAllPopups());
  }

  function handleGenerate(studies) {
    setIsLoading(true);
    studiesApi
      .newGeneration(studies)
      .then((response) => {
        setIsLoading(false);
        const anchor = document.createElement("a");
        anchor.href = BASE_URL + response.data.url.slice(1);
        anchor.target = "_blank";
        anchor.download = "generations.zip";
        anchor.click();
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
        closeAllPopups();
        openErrorPopup(err.statusText);
      });
  }

  function onContextMenu() {
    return false;
  }

  function choiceUser(userId) {
    setIsLoading(true);

    studiesApi
      .getUserStudies(userId)
      .then((res) => {
        setStudies(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
        closeAllPopups();
        openErrorPopup(err.statusText);
      })
      .finally(setIsLoading(false));
  }

  function choiceStudy(study) {
    window.location = `/dashboard/${study.unique_id}?state=${study.state}`;
  }

  function generateZip(files) {
    closeAllPopups();
    setIsLoading(true);
    const zip = new JSZip();
    for (let i = 0; i < files.length; i++) {
      zip.file(files[i].name, files[i]);
    }

    return zip;
  }

  return (
    <>
      <div className='App' onContextMenu={onContextMenu}>
        <div className='page'>
          <Router>
            <Header isSuperUser={isSuperUser} />

            <main className='content'>
              <Routes>
                <Route path='*' element={<PageNotFound />} />
                <Route path='/' element={<Navigate to='/signin' />} />
                <Route path='/signin' exact element={<SignIn />} />
                <Route
                  path='/signup'
                  exact
                  element={<SignUp openErrorPopup={openErrorPopup} />}
                />
                <Route
                  path='/users'
                  exact
                  element={
                    <UsersList
                      users={users}
                      getUsers={getUsers}
                      choiceUser={choiceUser}
                      isSuperUser={isSuperUser}
                    />
                  }
                />
                <Route
                  path='/users/:id'
                  exact
                  element={
                    <Study
                      openEditPopup={openEditPopup}
                      openDeletePopup={openDeletePopup}
                      openAddPopup={openAddPopup}
                      studies={studies}
                      getStudies={getStudies}
                      choiceStudy={choiceStudy}
                      isSuperUser={isSuperUser}
                      getUserStudies={choiceUser}
                    />
                  }
                />
                <Route
                  path='user/:uid'
                  element={<Permission onClose={closeAllPopups} />}
                />
                {!isSuperUser && (
                  <Route
                    path='/study'
                    exact
                    element={
                      <Study
                        openEditPopup={openEditPopup}
                        openDeletePopup={openDeletePopup}
                        openAddPopup={openAddPopup}
                        studies={studies}
                        getStudies={getStudies}
                        choiceStudy={choiceStudy}
                        isSuperUser={isSuperUser}
                      />
                    }
                  />
                )}

                <Route
                  path='/generation'
                  exact
                  element={
                    <Generation
                      isGenerated={isGenerated}
                      onSubmit={handleGenerate}
                      generateZip={generateZip}
                    />
                  }
                />
                <Route path='/dashboard/:uid' exact element={<Dashboard />} />
              </Routes>
            </main>
          </Router>
        </div>
      </div>

      <EditPopup
        study={study}
        isOpen={isOpenEditPopup}
        onClose={closeAllPopups}
        onEdit={editStudy}
      />

      <DeletePopup
        study={study}
        isOpenDeletePopup={isOpenDeletePopup}
        closeAllPopups={closeAllPopups}
        deleteStudy={deleteStudy}
      />

      <AddPopup
        isOpenAddPopup={isOpenAddPopup}
        closeAllPopups={closeAllPopups}
        addStudy={addStudy}
        generateZip={generateZip}
      />

      <PopupInfo
        title='Ошибка'
        info={infoText}
        isOpen={isOpenErrorPopup}
        onClose={closeAllPopups}
      />

      <Preloader isLoading={isLoading} />
    </>
  );
};

const mapStateToProps = (state) => ({
  token: state.auth.token,
  refresh: state.auth.refresh,
  isSuperUser: state.auth.isSuperUser,
});

export default connect(mapStateToProps, { refreshToken })(App);
