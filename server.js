const { MongoClient } = require("mongodb");

// URL de conexión de MongoDB Atlas
const url = 'mongodb+srv://juan.1802011916:Lupe@drakobets.sm7rm2c.mongodb.net/?appName=DrakoBets';

const client = new MongoClient(url);

async function getCarDetailsByModelId(modelId) {
  try {
    await client.connect();

    const db = client.db("CarrosCloud"); // 
    const collection = db.collection("CAR_DETAILS");
	
	const modelos2 = await collection.distinct("CAR_NAME.MODEL_DETAIL.MODELID");
	console.log("MODELIDs en CAR_NAME.MODEL_DETAIL.MODELID:", modelos2);


    const pipeline = [
      {
        $match: {
          "CAR_NAME.MODEL_DETAIL.MODELID": modelId
        }
      },
      {
        $project: {
          _id: 0,
          Descripcion: "$CAR_NAME.DESCRIPTION",
          Modelo: "$CAR_NAME.MODEL_DETAIL.MODEL",
          PrecioUnitario: "$CAR_NAME.MODEL_DETAIL.VALORUNI",
          TotalDisponible: "$CAR_NAME.MODEL_DETAIL.TOTALCARS"
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();

    if (results.length === 0) {
      console.log("No se encontraron autos para ese modelo.");
    } else {
      results.forEach((car) => {
        console.log("Descripción:", car.Descripcion);
        console.log("Modelo:", car.Modelo);
        console.log("Precio Unitario:", car.PrecioUnitario);
        console.log("Total Disponible:", car.TotalDisponible);
        console.log("-----------");
      });
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

// Llamamos la función con MODELID = 2
getCarDetailsByModelId(2);
