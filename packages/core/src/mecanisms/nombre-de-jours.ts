
import { EvaluationFunction } from '..'
import { ASTNode, Unit } from '../AST/types'
import {
	convertToDate,
	countWeekday,
	convertToString
} from '../date'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { defaultNode, mergeAllMissing } from '../evaluationUtils'
import parse from '../parse'
import { parseUnit } from '../units'

export type NombreDeJoursNode = {
	explanation: {
		depuis: ASTNode
		"jusqu'à": ASTNode
		"référence": ASTNode
	}
	unit: Unit
	nodeKind: 'nombre de jours'
}

const evaluate: EvaluationFunction<'nombre de jours'> = function (node) {
	const fromNode = this.evaluateNode(node.explanation.depuis)
	const toNode = this.evaluateNode(node.explanation["jusqu'à"])
	const refNode = this.evaluateNode(node.explanation["référence"])

	const from = fromNode.nodeValue as string
	const to = toNode.nodeValue as string
	const ref = refNode.nodeValue as string

	let nodeValue: number = 0
	if (ref === "lundi")
		nodeValue = countWeekday(convertToDate(from),convertToDate(to), 1)
	else if (ref === "mardi")
		nodeValue = countWeekday(convertToDate(from),convertToDate(to), 2)
	else if (ref === "mercredi")
		nodeValue = countWeekday(convertToDate(from),convertToDate(to), 3)
	else if (ref === "jeudi")
		nodeValue = countWeekday(convertToDate(from),convertToDate(to), 4)
	else if (ref === "vendredi")
		nodeValue = countWeekday(convertToDate(from),convertToDate(to), 5)
	else if (ref === "samedi")
		nodeValue = countWeekday(convertToDate(from),convertToDate(to), 6)
	else if (ref === "dimanche")
		nodeValue = countWeekday(convertToDate(from),convertToDate(to), 0)
	else
		nodeValue = 0

	return {
		...node,
		nodeValue,
		missingVariables: mergeAllMissing([fromNode, toNode]),
		explanation: {
			depuis: fromNode,
			"jusqu'à": toNode,
			"référence": refNode
		},
	}
}

registerEvaluationFunction('nombre de jours', evaluate)

export default function parseNombreDeJours(v, context) {
	const today = defaultNode(convertToString(new Date()))

	const explanation = {
		depuis: parse(v.depuis ?? today, context),
		"jusqu'à": parse(v["jusqu'à"] ?? today, context),
		"référence": parse(v["référence"], context),
	}
	const unit = parseUnit('jour')
	return {
		explanation,
		unit,
		nodeKind: 'nombre de jours',
	} as NombreDeJoursNode
}

parseNombreDeJours.nom = 'nombre de jours'
