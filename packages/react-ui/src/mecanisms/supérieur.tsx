import { EvaluatedNode } from 'publicodes'
import Explanation from '../Explanation'
import { InfixMecanism } from './common/InfixMecanism'

export default function MecanismSupérieur(node: EvaluatedNode<'supérieur'>) {
	return (
		<InfixMecanism value={node.explanation.valeur as EvaluatedNode}>
			<p>
				<strong>Arrondi supérieur : </strong>
				<Explanation node={node.explanation.supérieur} />
			</p>
		</InfixMecanism>
	)
}
