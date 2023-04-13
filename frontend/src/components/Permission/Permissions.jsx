import PopupInfo from "../../elements/Popup/PopupInfo"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { BASE_URL } from "../../constans"

const Permission = ({ onClose }) => {

    const { uid } = useParams()
    const [isOpen, setIsOpen] = useState(false)
    const [text, setText] = useState(false)

    useEffect(() => {
        const config = {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        }
        axios.get(BASE_URL + `api/user/${uid}`, config).then((response) => {
            setText(response.data["success"])
            setIsOpen(true)
            setTimeout(() => {
                window.location = "/users"
            }, 1000)
        }).catch( () => {
            if (response.data["error"] !== undefined) {
                setText(response.data["error"])
                setIsOpen(true)
                setTimeout(() => {
                    window.location = "/signin"
                }, 1000)
            } else {
                setText("Войдите в аккаунт")
                setIsOpen(true)
                setTimeout(() => {
                    window.location = "/signin"
                }, 1000)
            }
        })
    })

    return (
        <PopupInfo
            title="Получение доступа к исследованиям"
            info={text}
            isOpen={isOpen}
            onClose={onClose}
        />
    )
}

export default Permission