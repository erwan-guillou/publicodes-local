import { EvaluationFunction, simplifyNodeUnit } from '..'
import { ASTNode, EvaluatedNode } from '../AST/types'
import { PublicodesError } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { mergeAllMissing } from '../evaluationUtils'
import parse from '../parse'
import { serializeUnit } from '../units'

export type SupérieurNode = {
	explanation: {
		'supérieur': ASTNode
		valeur: ASTNode
	}
	nodeKind: 'supérieur'
}

function ceilWithPrecision(n: number, fractionDigits: number) {
	const v = (
		Math.ceil((n + Number.EPSILON) * 10 ** fractionDigits) /
		10 ** fractionDigits
	)
	return v;
}

const evaluate: EvaluationFunction<'supérieur'> = function (node) {
	// We need to simplify the node unit to correctly round values containing
	// percentages units, see #1358
	const valeur = simplifyNodeUnit(this.evaluateNode(node.explanation.valeur))
	const nodeValue = valeur.nodeValue
	let arrondi = node.explanation['supérieur']
	if (nodeValue !== false) {
		arrondi = this.evaluateNode(arrondi)

		if (
			typeof (arrondi as EvaluatedNode).nodeValue === 'number' &&
			!serializeUnit((arrondi as EvaluatedNode).unit)?.match(/décimales?/)
		) {
			throw new PublicodesError(
				'EvaluationError',
				`L'unité ${serializeUnit(
					(arrondi as EvaluatedNode).unit,
				)} de l'arrondi est inconnu. Vous devez utiliser l'unité “décimales”`,
				{ dottedName: this.cache._meta.evaluationRuleStack[0] },
			)
		}
	}

	const result = {
		...node,
		nodeValue:
			typeof valeur.nodeValue !== 'number' || !('nodeValue' in arrondi) ?
				valeur.nodeValue
			: typeof arrondi.nodeValue === 'number' ?
				ceilWithPrecision(valeur.nodeValue, arrondi.nodeValue)
			: arrondi.nodeValue === true ? ceilWithPrecision(valeur.nodeValue, 0)
			: arrondi.nodeValue === undefined ? undefined
			: valeur.nodeValue,
		explanation: { valeur: valeur, 'supérieur': arrondi },
		missingVariables: mergeAllMissing([valeur, arrondi]),
		unit: valeur.unit,
	}
	return result;
}

export default function parseSupérieur(v, context) {
	const explanation = {
		valeur: parse(v.valeur, context),
		'supérieur': parse(v['supérieur'], context),
	}
	return {
		explanation,
		nodeKind: parseSupérieur.nom,
	}
}

parseSupérieur.nom = 'supérieur' as const

registerEvaluationFunction(parseSupérieur.nom, evaluate)
