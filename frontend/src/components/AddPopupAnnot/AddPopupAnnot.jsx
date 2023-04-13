import PopupWithForm from "../../elements/Popup/PopupWithForm";
import Dropzone from "../../elements/Dropzone/Dropzone";
import { useState } from "react";

function AddPopupAnnot({ isOpenAddPopup, closeAllPopups, addStudy }) {

    const [newFile, setNewFile] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        addStudy(newFile[0]);
      }

  return (
    <PopupWithForm
      name="add"
      title="Добавить файл разметки"
      buttonText="Добавить"
      isOpen={isOpenAddPopup}
      onClose={closeAllPopups}
      onSubmit={handleSubmit}
    >
      <Dropzone setNewFile={setNewFile} />
    </PopupWithForm>
  );
}

export default AddPopupAnnot;
