
import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import {
	convertToDate,
	convertToString,
	normalizeDate
} from '../date'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { defaultNode } from '../evaluationUtils'
import parse from '../parse'

export type DébutDuMoisNode = {
	explanation: ASTNode
	nodeKind: 'début du mois'
}

const evaluate: EvaluationFunction<'début du mois'> = function (node) {
	const valeur = this.evaluateNode(node.explanation)
	let nodeValue = valeur.nodeValue
	if (nodeValue !== null)
	{
		if (typeof nodeValue === 'string'
				&& nodeValue.match?.(/^[\d]{2}\/[\d]{2}\/[\d]{4}$/))
		{
			const date = convertToDate(nodeValue)
			const date2 = new Date(date.getFullYear(), date.getMonth(), 1)
			nodeValue = convertToString(date2)
		}
		else
		{
			// produire une erreur car ce n'est pas une date
		}
	}
	return {
		...node,
		nodeValue,
		missingVariables: valeur.missingVariables,
		explanation: valeur,
	}
}

registerEvaluationFunction('début du mois', evaluate)

export default function parseDébutDuMois(v, context) {
	const today = defaultNode(convertToString(new Date()))

	const explanation = parse(v ?? today, context)
	return {
		explanation,
		nodeKind: 'début du mois',
	} as DébutDuMoisNode
}

parseDébutDuMois.nom = 'début du mois'
