
import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import {
	convertToDate,
	convertToString
} from '../date'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { defaultNode } from '../evaluationUtils'
import parse from '../parse'

export type FinDuMoisNode = {
	explanation: ASTNode
	nodeKind: 'fin du mois'
}

const evaluate: EvaluationFunction<'fin du mois'> = function (node) {
	const valeur = this.evaluateNode(node.explanation)
	let nodeValue = valeur.nodeValue
	if (nodeValue !== null)
	{
		if (typeof nodeValue === 'string'
				&& nodeValue.match?.(/^[\d]{2}\/[\d]{2}\/[\d]{4}$/))
		{
			const date = convertToDate(nodeValue)
			const date2 = new Date(date.getFullYear(), date.getMonth() + 1, 0)
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

registerEvaluationFunction('fin du mois', evaluate)

export default function parseFinDuMois(v, context) {
	const today = defaultNode(convertToString(new Date()))

	const explanation = parse(v ?? today, context)
	return {
		explanation,
		nodeKind: 'fin du mois',
	} as FinDuMoisNode
}

parseFinDuMois.nom = 'fin du mois'
