"use strict";
module.exports.wearClothing = (pmcData, body, sessionID) => {
	for (let i = 0; i < body.suites.length; i++) {
		let suite = customization_f.getCustomization(body.suites[i]);

		// this parent reffers to Lower Node
		if (suite._parent == "5cd944d01388ce000a659df9") {
			pmcData.Customization.Feet = suite._props.Feet;
		}

		// this parent reffers to Upper Node
		if (suite._parent == "5cd944ca1388ce03a44dc2a4") {
			pmcData.Customization.Body = suite._props.Body;
			pmcData.Customization.Hands = suite._props.Hands;
		}
	}

	return item_f.handler.getOutput(sessionID);
}
