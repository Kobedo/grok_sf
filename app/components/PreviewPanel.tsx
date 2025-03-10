import styled from 'styled-components';

const PreviewContainer = styled.div`
  width: 270px;
  border: 1px solid black;
  padding: 10px;
  margin-bottom: 10px;
`;

const ProductName = styled.div`
  text-align: center;
  font-size: 10pt;
  font-weight: bold;
  margin-bottom: 5px;
`;

const SupplementFacts = styled.div`
  max-width: 248px;
  border: 1px solid black;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 14pt;
  text-align: center;
`;

const Serving = styled.div`
  font-size: 10pt;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Divider = styled.div`
  border-top: 2px solid black;
  margin: 5px 0;
`;

interface Ingredient {
  nutrient: string;
  amount: string;
  unit: string;
  percent?: string;
}

interface PanelData {
  productName?: string;
  servingSize?: string;
  servings?: string;
}

interface Props {
  dvIngredients: Ingredient[];
  nonDvIngredients: Ingredient[];
  panelData: PanelData;
}

function PreviewPanel({ dvIngredients, nonDvIngredients, panelData }: Props) {
  const { productName = 'Not specified', servingSize = 'Not specified', servings = 'Not specified' } = panelData;

  return (
    <PreviewContainer>
      <h2>Preview</h2>
      <ProductName>{productName}</ProductName>
      <SupplementFacts>
        <Title>Supplement Facts</Title>
        <Serving>Serving Size: {servingSize}</Serving>
        <Serving>Servings Per Container: {servings}</Serving>
        <Table>
          <tbody>
            {dvIngredients.map((item, idx) => {
              const percentValue = parseFloat(item.percent?.match(/(\d*\.?\d+)/)?.[0] || '0');
              const displayPercent = percentValue === 0 || percentValue < 1 ? '<1%' : item.percent;
              return (
                <tr key={idx}>
                  <td>{item.nutrient}</td>
                  <td>{`${item.amount} ${item.unit}`}</td>
                  <td>{displayPercent}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Divider />
        <Table>
          <tbody>
            {nonDvIngredients.map((item, idx) => (
              <tr key={idx}>
                <td>{item.nutrient}</td>
                <td>{`${item.amount} ${item.unit}`}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SupplementFacts>
    </PreviewContainer>
  );
}

export default PreviewPanel;