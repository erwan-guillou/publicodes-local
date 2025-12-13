import { EvaluatedNode } from 'publicodes'
import DefaultInlineMecanism from './common/DefaultInlineMecanism'

export default function MecanismNombreDeJours(node: EvaluatedNode<"nombre de jours">) {
	return (
		<DefaultInlineMecanism
			{...node}
			sourceMap={{
				mecanismName: node.nodeKind,
				args: node.explanation,
			}}
		/>
	)
}
