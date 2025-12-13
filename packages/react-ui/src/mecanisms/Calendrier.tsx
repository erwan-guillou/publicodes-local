import { EvaluatedNode } from 'publicodes'
import DefaultInlineMecanism from './common/DefaultInlineMecanism'

export default function MecanismCalendrier(node: EvaluatedNode<
	| "début du mois"
	| "fin du mois"
	| "début d'année"
>) {
	return (
		<DefaultInlineMecanism
			{...node}
			sourceMap={{
				mecanismName: node.nodeKind,
				args: { valeur: node.explanation },
			}}
		/>
	)
}
