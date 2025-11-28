
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * onUpdateOrder
 *
 * Cette fonction se déclenche à chaque écriture (création ou mise à jour) dans la collection 'orders'.
 * Elle calcule automatiquement 'totalExpenses' et 'profit' pour la commande.
 * Pour éviter les boucles infinies, la fonction vérifie si les valeurs calculées
 * sont différentes de celles déjà présentes avant d'effectuer une mise à jour.
 */
exports.onUpdateOrder = onDocumentWritten("orders/{orderId}", async (event) => {
  const snap = event.data.after;
  const beforeSnap = event.data.before;
  const orderData = snap.data();

  // Si le document a été supprimé, il n'y a rien à faire.
  if (!orderData) {
    logger.info(`Order ${snap.id} deleted, no action needed.`);
    return;
  }

  const orderCost = orderData.orderCost || 0;
  const shippingCost = orderData.shippingCost || 0;
  const additionalFees = orderData.additionalFees || 0;
  const orderPrice = orderData.orderPrice || 0;

  const totalExpenses = orderCost + shippingCost + additionalFees;
  const profit = orderPrice - totalExpenses;

  const updateData = {};
  let needsUpdate = false;

  const previousData = beforeSnap?.data() || {};

  // Comparer les valeurs pour éviter les mises à jour inutiles et les boucles infinies
  if (previousData.totalExpenses !== totalExpenses) {
    updateData.totalExpenses = totalExpenses;
    needsUpdate = true;
  }
  if (previousData.profit !== profit) {
    updateData.profit = profit;
    needsUpdate = true;
  }

  // Mettre à jour l'heure de modification uniquement si d'autres champs changent
  // ou si c'est une création.
  if (needsUpdate || !beforeSnap.exists) {
      updateData.editedAt = admin.firestore.FieldValue.serverTimestamp();
      needsUpdate = true;
  }


  if (needsUpdate) {
    logger.info(`Updating order ${snap.id} with:`, updateData);
    try {
      // Utilisation de { merge: true } pour éviter d'écraser des champs non liés
      await snap.ref.set(updateData, { merge: true });
      logger.info(`Successfully updated order ${snap.id}.`);
    } catch (error) {
      logger.error(`Error updating order ${snap.id}:`, error);
    }
  } else {
    logger.info(`No update needed for order ${snap.id}.`);
  }
});

/**
 * importOrder
 *
 * Un endpoint de webhook HTTP pour créer une nouvelle commande via une requête POST.
 * Accepte une charge utile JSON correspondant à la structure d'une commande.
 * Si 'createdByUid' et 'createdByEmail' sont fournis, ils sont ajoutés au document.
 *
 * URL du Webhook (exemple) :
 * https://<REGION>-<PROJECT_ID>.cloudfunctions.net/importOrder
 */
exports.importOrder = onRequest(
  { cors: true }, // Permet les requêtes cross-origin
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const orderData = req.body;
      logger.info("Received order data for import:", orderData);

      // Valider les données minimales requises
      if (!orderData || !orderData.etsyOrderId || !orderData.orderPrice) {
        logger.error("Validation failed: Missing required fields.");
        res.status(400).send("Bad Request: Missing etsyOrderId or orderPrice.");
        return;
      }

      const newOrder = {
        ...orderData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        editedAt: admin.firestore.FieldValue.serverTimestamp(), // Initialiser editedAt
      };
      
      // Ajout des informations sur le créateur si elles sont fournies
      if(req.body.createdByUid) {
        newOrder.createdByUid = req.body.createdByUid;
      }
      if(req.body.createdByEmail) {
        newOrder.createdByEmail = req.body.createdByEmail;
      }

      const writeResult = await admin.firestore().collection("orders").add(newOrder);
      logger.info(`Successfully created order with ID: ${writeResult.id}`);
      res.status(201).send({
        message: "Order created successfully",
        orderId: writeResult.id,
      });

    } catch (error) {
      logger.error("Error creating order:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);
