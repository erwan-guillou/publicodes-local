
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

export type SuivantNode = {
	explanation: ASTNode
	nodeKind: 'suivant'
}

const evaluate: EvaluationFunction<'suivant'> = function (node) {
	const valeur = this.evaluateNode(node.explanation)
	let nodeValue = valeur.nodeValue
	if (nodeValue !== null)
	{
		if (typeof nodeValue === 'string'
				&& nodeValue.match?.(/^[\d]{2}\/[\d]{2}\/[\d]{4}$/))
		{
			const date = convertToDate(nodeValue)
			const date2 = new Date(date.getFullYear(), date.getMonth() + 1, 1)
			nodeValue = normalizeDate(date2.getFullYear(), date2.getMonth()+1, date2.getDate())
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

registerEvaluationFunction('suivant', evaluate)

export default function parseSuivant(v, context) {
	const today = defaultNode(convertToString(new Date()))

	const explanation = parse(v ?? today, context)
	return {
		explanation,
		nodeKind: 'suivant',
	} as SuivantNode
}

parseSuivant.nom = 'suivant'
