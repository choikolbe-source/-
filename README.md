# The Dread Index

Free beta deployment repository.

Production beta: https://funny-crepe-b6dfb9.netlify.app

To enable automatic deployment to the existing Netlify site, open **Site configuration → Build & deploy → Continuous deployment → Link repository**, select `choikolbe-source/-`, choose branch `main`, build command blank, publish directory `.`.

The site needs `index.html` at the repository root before enabling deploys. `netlify.toml` config is included.

Note: GitHub commits deploy automatically only after Netlify connection is authorized in the Netlify account.
