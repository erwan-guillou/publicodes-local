
import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import {
	convertToDate,
	convertToString
} from '../date'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { defaultNode } from '../evaluationUtils'
import parse from '../parse'

export type PrécédentNode = {
	explanation: ASTNode
	nodeKind: 'précédent'
}

const evaluate: EvaluationFunction<'précédent'> = function (node) {
	const valeur = this.evaluateNode(node.explanation)
	let nodeValue = valeur.nodeValue
	if (nodeValue !== null)
	{
		if (typeof nodeValue === 'string'
				&& nodeValue.match?.(/^[\d]{2}\/[\d]{2}\/[\d]{4}$/))
		{
			if (valeur.unit === undefined)
			{
				const date = convertToDate(nodeValue)
				const date2 = new Date(date.getFullYear(), date.getMonth(), date.getDate()-1)
				nodeValue = convertToString(date2)
			}
			else if (valeur.unit.numerators.includes('jour'))
			{
				const date = convertToDate(nodeValue)
				const date2 = new Date(date.getFullYear(), date.getMonth(), date.getDate()-1)
				nodeValue = convertToString(date2)
			}
			else if (valeur.unit.numerators.includes('mois'))
			{
				const date = convertToDate(nodeValue)
				const date2 = new Date(date.getFullYear(), date.getMonth()-1, 1)
				nodeValue = convertToString(date2)
			}
			else if (valeur.unit.numerators.includes('an'))
			{
				const date = convertToDate(nodeValue)
				const date2 = new Date(date.getFullYear()-1, 0, 1)
				nodeValue = convertToString(date2)
			}
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

registerEvaluationFunction('précédent', evaluate)

export default function parsePrécédent(v, context) {
	const today = defaultNode(convertToString(new Date()))

	const explanation = parse(v ?? today, context)
	return {
		explanation,
		nodeKind: 'précédent',
	} as PrécédentNode
}

parsePrécédent.nom = 'précédent'
