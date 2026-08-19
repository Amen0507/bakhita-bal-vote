# Backend — photos des candidats

Les photos sont converties en WebP avant stockage et leur URL est enregistrée
dans `photo_url` (ou dans les deux champs photo d'un duo). Les pages de vote,
des candidats et des résultats publics utilisent déjà ces URL : une photo
enregistrée s'affichera donc aussi dans les résultats publiés.

## Développement local

`CLOUDINARY_URL` est optionnel. En son absence, les photos sont conservées dans
`backend/media/` et disponibles via `http://localhost:8000/media/...`. Cela
permet de tester immédiatement l'upload sans compte Cloudinary.

## Production (Railway)

Ajoutez la variable `CLOUDINARY_URL` dans les variables de service Railway :

```text
cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

Cloudinary est nécessaire en production : le disque local de Railway peut être
réinitialisé lors d'un redéploiement ou d'un redémarrage. Une fois cette
variable définie, l'API renvoie l'URL HTTPS Cloudinary, durable et directement
affichable par le frontend.
