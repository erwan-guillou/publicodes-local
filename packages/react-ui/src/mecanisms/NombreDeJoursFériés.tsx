import { EvaluatedNode } from 'publicodes'
import DefaultInlineMecanism from './common/DefaultInlineMecanism'

export default function MecanismNombreDeJoursFériés(node: EvaluatedNode<"nombre de jours fériés">) {
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
