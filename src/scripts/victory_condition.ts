interface VictoryCondition { //Currently the only victory condition type is 'ENTITY_EXISTS': check if entities following some requirements exist.
	type: "ENTITY_EXISTS";
	entityType: string;
	requiredProperties?: Array<PropertyRequirement>;
}
namespace VictoryCondition {
	function checkPropertyRequirements(entity: any, requirements?: Array<PropertyRequirement>) {
		if (!requirements) {
			return true;
		}

		for (let requirement of requirements) {
			if (!entity.hasOwnProperty(requirement.name)) {
				return false;
			}

			//The only property requirement type currently supported is 'property greater than'
			if (requirement.requirementType && !(entity[requirement.name] > requirement.value)) {
				return false;
			}
		}

		return true;
	}

	export function check(victoryCondition: VictoryCondition, entities: Array<any>) {
		let entitiesMeetingRequirements = 0;
		for (let entity of entities) {
			if (victoryCondition.entityType !== entity.type) {
				continue;
			}

			if (checkPropertyRequirements(entity, victoryCondition.requiredProperties)) {
				entitiesMeetingRequirements++;
			}
		}
		if (entitiesMeetingRequirements > 0) {
			return true;
		}
	}
}

interface PropertyRequirement {
	name: string;
	requirementType?: "GREATER_THAN";
	value?: number;
}
