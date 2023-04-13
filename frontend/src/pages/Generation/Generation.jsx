import "./Generation.css";
import Dropzone from "../../elements/Dropzone/Dropzone";
import GenerationForm from "../../elements/GenerationForm/GenerationForm";
import { useState } from "react";

function Generation({ isGenerated, onSubmit, generateZip }) {
  const [newFile, setnewFile] = useState("");

  function handleGenerate(data) {
    if (newFile[0].name.split(".").at(-1) !== "zip") {
      const zip = generateZip(newFile);
      zip.generateAsync({ type: "blob" }).then((content) => {
        const formData = new FormData();
        formData.append("file", content);
        for (let key in data) {
          formData.append(key, data[key]);
        }
        onSubmit(formData);
      });
    } else {
      alert(
        "Мы пока не поддерживаем загрузку zip архива, выберете множество файлов (ctrl+A)"
      );
    }
  }

  return (
    <div className="generation">
      <h1 className="generation__title">Генерация патологий</h1>
      <div className="generation__container">
        <div className="generation__dropzone">
          <Dropzone setNewFile={setnewFile} />
        </div>
        <div className="generation__data">
          <GenerationForm onSubmit={handleGenerate} />
        </div>
      </div>
    </div>
  );
}

export default Generation;
