
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

export type DébutDAnnéeNode = {
	explanation: ASTNode
	nodeKind: "début d'année"
}

const evaluate: EvaluationFunction<"début d'année"> = function (node) {
	const valeur = this.evaluateNode(node.explanation)
	let nodeValue = valeur.nodeValue
	if (nodeValue !== null)
	{
		if (typeof nodeValue === "number")
			nodeValue = `01/01/${nodeValue}`
		else if (typeof nodeValue === 'string'
				&& nodeValue.match?.(/^[\d]{2}\/[\d]{2}\/[\d]{4}$/))
		{
			const date = convertToDate(nodeValue)
			const date2 = new Date(date.getFullYear(), 0, 1)
			nodeValue = convertToString(date2)
		}
		else
		{
			// produire une erreur car ce n'est pas une date ou une annee
		}
	}
	return {
		...node,
		nodeValue,
		missingVariables: valeur.missingVariables,
		explanation: valeur,
	}
}

registerEvaluationFunction("début d'année", evaluate)

export default function parseDébutDAnnée(v, context) {
	const today = defaultNode(convertToString(new Date()))

	const explanation = parse(v ?? today, context)
	return {
		explanation,
		nodeKind: "début d'année",
	} as DébutDAnnéeNode
}

parseDébutDAnnée.nom = "début d'année"
