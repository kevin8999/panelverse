# CONTRIBUTING

First, make a fork of this repository onto your GitHub account.

Second, download the forked repository.

```shell
git clone https://github.com/your-username/panel-verse
```

where `your-username` is the username of your GitHub account.

Third, change into the project directory.

```shell
cd panel-verse/
```

Fourth, create a virtual environment.

```shell
python -m venv .venv
```

Fifth, activate the virtual environment.

- If you are on Windows, run

```shell
source .venv/Scripts/activate
```

- If you are on MacOS or Linux, run:


```shell
source .venv/bin/activate
```

Sixth, download the project requirements.

```shell
pip install -r requirements.txt
```

---

To run the app, change into the `my-app/` directory.

```shell
cd panel-verse/my-app/
```

Next, run

```shell
npm install
```

Then, run

```shell
npm run dev
```

The app should now run on `localhost`.