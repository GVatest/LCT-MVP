<h1 align="center">𝕃ℂ𝕋-𝕄𝕍ℙ</h1>

> Веб-платформа для разметки медицинских изображений и генерации патологий на исследованиях здоровых пациентов. `MVP` команды `FutureOfMedTech`, разработанный в рамках хакатона `ЛЦТ 2022`.

## Screenshots

<img width="1440" alt="Screenshot 2023-04-12 at 00 40 19" src="https://user-images.githubusercontent.com/66703210/231867453-370802ec-7507-440c-b423-d73b3fdd516b.png">
<img width="1440" alt="Screenshot 2023-04-12 at 00 48 01" src="https://user-images.githubusercontent.com/66703210/231867475-33f7712d-6221-44f1-b095-5f3e594eb75d.png">
<img width="1440" alt="Screenshot 2023-04-12 at 00 50 38" src="https://user-images.githubusercontent.com/66703210/231867488-bcbcb6cd-69ae-4d61-ba98-5e462e8b7e2a.png">
<img width="1440" alt="Screenshot 2023-04-12 at 00 44 18" src="https://user-images.githubusercontent.com/66703210/231867508-4503bf97-3c54-43b8-b8e6-db7c1d78504a.png">

## Start

**_Clone_**

```bash
git clone https://github.com/GVatest/LCT-MVP
cd hedge-fund
```

### Backend

**_Install_**

```bash
pip install -r requirements.txt
```

**_Start_**

Create database

```bash
python manage.py migrate
```

Start server

```bash
python manage.py runserver
```

### Frontend

**_Install_**

```bash
npm install
# or
yarn install
```

**_Start_**

```bash
npm run dev
# or
yarn dev
```

## About

- API был разработан на основе `django rest framework` с использованием базы данных `sqlite3`, так как это `mvp` проекта, с `sqlite3` работать было проще и быстрее чем с ее более продвинутыми альтернативами, такими как `postgresql`.
- Авторизация реализована на основе `JWT` токенов
- Фронтенд реализован с использованием библиотеки `React` в связке с менеджером состояний `Redux`
- Подгрузка и обработка `Dicom` слайсов на фронт производится с помощью библиотеки с открытым исходным кодом `[DWV](https://www.npmjs.com/package/dwv)`
- Функционал разметчика основан на функционале библиотеки для работы с алгоритмами компьютерного зрения `[OpenCV.js](https://docs.opencv.org/4.6.0/d5/d10/tutorial_js_root.html)`

## Stack

### Frontend

<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"></img></a>
<a href="https://reactjs.org/)"><img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB"></img></a>
<a href="https://redux.js.org/"><img src="https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white"></img></a>

### Backend

<a href="https://www.django-rest-framework.org/"><img src="https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&logoColor=white&color=ff1709&labelColor=gra"></img></a>

## _Additional_

Я был одним из участников команды `FutureOfMedTech` на хакатоне 2022 года, выступал в качестве `full stack` разработчика. Взял на себя обязанности по написанию `API` и проектированию базы данных, также принимал активное участие в разработке фронтенда приложения, настроил авторизацию по `JWT` токенам, реализовал доступ к данным другого аккаунта по ссылке, подгрузку, первичную обработку и отображение Dicom слайсов, участвовал в написании функционала разметчика: импорт и экспорт разметки в `json`, множественная подгрузка изображений, скролл изображений, инструментов разметки. Также взял на себя ответственность по мерджу трех модулей приложения: модуль генерации патологий, разметчик `Dicom` изображений, система менеджмента исследований и сотрудников. Финальным испытанием был деплой и настройка приложения на удаленном сервере, для этого использовал дефолтную для `django` связку `nginx` + `gunicorn`.

## Credits

Contributors:

- 👤 **Vasiliy Ganja**
  - `Github`: [@Gvatest](https://github.com/gvatest)
- 👤 **Maxim Kirilyuk**
  - `Github`: [@Werserk](https://github.com/werserk)
- 👤 **Balai Micheeva**
  - `Github`: [@Balaishka](https://github.com/Balaishka)

## License

[![Licence](https://img.shields.io/github/license/Ileriayo/markdown-badges?style=for-the-badge)](./LICENSE)
