interface VictoryCondition {
//Currently the only victory condition type is 'ENTITY_EXISTS': check if there are enough entities with some set of properties.
	type: "ENTITY_EXISTS";
	amount?: number; // default value = 1
	entityType: string;
	requiredProperties?: Array<PropertyRequirement>;
}
namespace VictoryCondition {
	function entityMeetsRequirement(entity, requirement) {
		switch (requirement.requirementType) {
			case "EQUALS":
				return entity[requirement.name] === requirement.value;
			case "GREATER_THAN":
				return entity.hasOwnProperty(requirement.name) && entity[requirement.name] > requirement.value;
			default: return false;
		}
	}

	function entityMeetsAllRequirements(entity: any, victoryCondition: VictoryCondition) {
		if (victoryCondition.entityType !== entity.type) {
			return false;
		}

		let requirements = victoryCondition.requiredProperties || [];
		for (let requirement of requirements) {
			if (!entityMeetsRequirement(entity, requirement)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Checks if an individual victory condition has been met
	 * @param victoryCondition the victory condition to check
	 * @param entities the models of all entities in the level
	 * @returns true if the condition was met, false otherwise
	 */
	export function check(victoryCondition: VictoryCondition, entities: Array<any>) {
		let entitiesMeetingRequirements = 0;
		for (let entity of entities) {
			if (entityMeetsAllRequirements(entity, victoryCondition)) {
				entitiesMeetingRequirements++;
			}
		}
		let requiredAmount = victoryCondition.amount !== undefined ? victoryCondition.amount : 1;

		return entitiesMeetingRequirements >= requiredAmount;
	}
}

interface PropertyRequirement {
	name: string;
	requirementType?: "GREATER_THAN" | "EQUALS";
	value?: number;
}
