# Angular AppConfig

This project is a simple POC to show how to setup an Angular app to be able to get it's application configuration from
environment variables.

## What is going on here?

Angular in itself is unable to read environment variables at runtime due to it running on the client's browser so we
need a way to get this from the server.

In order to achieve this I setup a simple api endpoint in the express server that serves the Angular Universal app. This
endpoint goes through the environment file and looks for any possible variables that are set in env vars to override,
and then sends just the overridden values in the response.

Now on the Angular side we need to ensure that these values are loaded before the rest of the application executes so we
don't have a mismatch between configs in different points of our app. To do this we can hook it up in our providers
to `APP_INITIALIZER` and this will make sure the app config is fully retrieved before bootstrapping the rest of the app.

E.g. in `app.module.ts`

```ts
// in your providers:
providers: [
  {
    provide: APP_INITIALIZER,
    useFactory: appInitializerFn,
    multi: true,
    deps: [AppConfigService],
  },
]

// appInitializerFn is the function that will actually be run to do whatever you need, in this case load our config
const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    return appConfig.loadAppConfig();
  };
};
```

The loadAppConfig function simply does an http get to the api endpoint to retrieve the config

`app-config.service.ts`

```ts
// Note using async/await because we only want first first response, we don't need a continuous subscription to the observable
// this also helps to ensure that the code will wait for the response before continuing, we need this to block 
// the rest of the code from executing
async
loadAppConfig()
{
  try {
    const data = await lastValueFrom(this.http.get('/api/config', { headers: { skip: 'true' } }));
    this.config = { ...environment, ...data };
  } catch (err) {
    console.warn('Unable to reach config service, using environment file.');
  }
}
```

## Getting started

To simply run this project and see how this works

```
npm run dev:ssr

OR

npm run build:ssr
npm run server:ssr
```

This will startup the Angular Universal server and once the app starts up you will see a screen that shows you the
application config that has been loaded. For this example, to change the config, simple set the variables with the same
name as the ones found in the environment file, prefixed with `ANGULAR_CONFIG_` to update the settings.

E.g. the following will change the apiUrl and production boolean

```
ANGULAR_CONFIG_apiUrl=https://localhost:4001 // default is empty string
ANGULAR_CONFIG_production=true // default false (when running dev mode)
```

## Pros

- Allows you to have a single build that can be deployed to multiple environments
- Allows you to change application settings without code changes or needing to redeploy your application

## Cons

- Increases initial loading time due to needing to do an api call before the rest of the application can even start
  loading, so the clients internet speed plays a huge role. (In this particular example, using angular universal ensures
  that the time to first paint will still be fast and then the client side app will load in the background and switch to
  client side once complete, this will help ensure the client can see something faster, but the time to interactive is
  still negatively impacted)

## Without Angular Universal

This same concept can also be applied to a pure client side Angular application that does not use Angular Universal, all
you need is a server somewhere to host your api config endpoint that can read that particular servers env variables
