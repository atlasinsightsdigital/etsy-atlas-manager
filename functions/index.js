
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

  const orderCost = orderData.orderCost || 0;
  const shippingCost = orderData.shippingCost || 0;
  const additionalFees = orderData.additionalFees || 0;
  const orderPrice = orderData.orderPrice || 0;

  const totalExpenses = orderCost + shippingCost + additionalFees;
  const profit = orderPrice - totalExpenses;

  const updateData = {};
  let needsUpdate = false;

  // Comparer les valeurs pour éviter les boucles infinies
  if (orderData.totalExpenses !== totalExpenses) {
    updateData.totalExpenses = totalExpenses;
    needsUpdate = true;
  }
  if (orderData.profit !== profit) {
    updateData.profit = profit;
    needsUpdate = true;
  }

  // Vérifier si l'utilisateur qui modifie a changé ou si c'est une nouvelle création.
  const userMakingChange = orderData.editedBy || orderData.createdByUid;
  const previousUser = beforeSnap?.data()?.editedBy;

  if (userMakingChange && userMakingChange !== previousUser) {
      updateData.editedBy = userMakingChange;
      updateData.editedAt = admin.firestore.FieldValue.serverTimestamp();
      needsUpdate = true;
  } else if (!beforeSnap.exists) { // Cas de la création
      if(userMakingChange) updateData.editedBy = userMakingChange;
      updateData.editedAt = admin.firestore.FieldValue.serverTimestamp();
      needsUpdate = true;
  }


  if (needsUpdate) {
    logger.info(`Updating order ${snap.id} with:`, updateData);
    try {
      await snap.ref.update(updateData);
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
