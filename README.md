<h1 align="center">𝕃ℂ𝕋-𝕄𝕍ℙ</h1>

> Web platform for annotating medical images and generating pathologies on studies of healthy patients. `MVP` of the `FutureOfMedTech` team, developed for the `LCT 2022` hackathon.

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

- API was developed based on `django rest framework` using `sqlite3` database, as it is an mvp project, working with `sqlite3` was easier and faster than its more advanced alternatives such as `postgresql`.
- Authorization is implemented based on `JWT` tokens
- The frontend is implemented using the `React` library in conjunction with the `Redux` state manager
- Loading and processing of `Dicom` slices on the front end is done using the open-source library `[DWV] (https://www.npmjs.com/package/dwv)`
- The functionality of the annotator is based on the functionality of the library for working with computer vision algorithms `[OpenCV.js] (https://docs.opencv.org/4.6.0/d5/d10/tutorial_js_root.html)`

## Stack

### Frontend

<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"></img></a>
<a href="https://reactjs.org/)"><img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB"></img></a>
<a href="https://redux.js.org/"><img src="https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white"></img></a>

### Backend

<a href="https://www.django-rest-framework.org/"><img src="https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&logoColor=white&color=ff1709&labelColor=gra"></img></a>

## _Additional_

I was the member of `FutureOfMedTech` team at the 2022 hackathon. As a `full stack` developer I took responsibility for writing the API, designing the database, and writing individual front-end modules: set up `JWT` authentication, loading, primary processing and displaying `Dicom` slides, participated in writing annotator functionality: annotation tools, import and export of annotation to `Json`, multiple image loading, image scrolling. Also took responsibility for merge of three application modules: pathology generation module, `Dicom` image annotator, studies and staff management system. The final challenge was to deploy and configure the application on a remote server, for this I used `nginx` + `gunicorn`.

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
