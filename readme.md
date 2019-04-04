# object-detection

An API and an app to detect objects on images.

### 👉 [Demo here](https://object-detection.now.sh)

![Screenshot of the app](screenshot.png)

If you want to read more about how this was made, [read the detailed article about it on ZEIT's blog](https://zeit.co/blog/serverless-machine-learning).

The repository contains two folders:

- `/api`, the code of the API taking care of detecting objects on images, powered by Tensorflow
- `/app`, the code of the frontend website, powered by Next.js

## Development

Running the API locally:

```
yarn --cwd api run dev
```

Running the app locally:

```
yarn --cwd app run dev
```
