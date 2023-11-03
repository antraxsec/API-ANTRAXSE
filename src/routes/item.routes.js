import { Router } from 'express'
import { deleteItem, getItem, postItem, putItem, getItemid } from '../controlers/item.controler.js'

const router = Router()


router.get('/itemid/:id', getItemid)

router.get('/item', getItem)

router.post('/item', postItem)

router.put('/item', putItem)

router.delete('/item', deleteItem)


export default router