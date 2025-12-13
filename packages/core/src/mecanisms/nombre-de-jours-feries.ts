
import { EvaluationFunction } from '..'
import { ASTNode, Unit } from '../AST/types'
import {
	convertToDate,
	howManyJoursFeriesInTimePeriod,
	convertToString
} from '../date'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { defaultNode, mergeAllMissing } from '../evaluationUtils'
import parse from '../parse'
import { parseUnit } from '../units'

export type NombreDeJoursFériésNode = {
	explanation: {
		depuis: ASTNode
		"jusqu'à": ASTNode
		"ignore repos": ASTNode
		"alsace moselle": ASTNode
	}
	unit: Unit
	nodeKind: 'nombre de jours fériés'
}

const evaluate: EvaluationFunction<'nombre de jours fériés'> = function (node) {
	const fromNode = this.evaluateNode(node.explanation.depuis)
	const toNode = this.evaluateNode(node.explanation["jusqu'à"])
	const reposNode = this.evaluateNode(node.explanation["ignore repos"])
	const alsaceNode = this.evaluateNode(node.explanation["alsace moselle"])

	const from = fromNode.nodeValue as string
	const to = toNode.nodeValue as string
	const repos = reposNode.nodeValue as boolean
	const alsace = alsaceNode.nodeValue as boolean

	let nodeValue: number = 0
	nodeValue = howManyJoursFeriesInTimePeriod(
		convertToDate(from),
		convertToDate(to),
		repos,alsace
	)

	return {
		...node,
		nodeValue,
		missingVariables: mergeAllMissing([fromNode, toNode]),
		explanation: {
			depuis: fromNode,
			"jusqu'à": toNode,
			"ignore repos": reposNode,
			"alsace moselle": alsaceNode
		},
		unit: { numerators: ['jour'], denominators: [] },
	}
}

registerEvaluationFunction('nombre de jours fériés', evaluate)

export default function parseNombreDeJoursFériés(v, context) {
	const today = defaultNode(convertToString(new Date()))

	const explanation = {
		depuis: parse(v.depuis ?? today, context),
		"jusqu'à": parse(v["jusqu'à"] ?? today, context),
		"ignore repos": parse(v["ignore repos"], context),
		"alsace moselle": parse(v["alsace moselle"], context),
	}
	const unit = parseUnit('jour')
	return {
		explanation,
		unit,
		nodeKind: 'nombre de jours fériés',
	} as NombreDeJoursFériésNode
}

parseNombreDeJoursFériés.nom = 'nombre de jours fériés'
