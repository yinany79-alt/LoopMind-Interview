/**
 * Hero — Faceup V5.1 首页主标题区。
 *
 * 设计:
 * - 两栏:HeroBrandBlock(左,大字+聚光灯+副标+CTA 一整块) / PortraitWall(右,5 张肖像)
 * - 不再额外加底部块,左侧 BrandBlock 自己装齐所有元素
 */
import HeroBrandBlock from './HeroBrandBlock'
import PortraitWall from './PortraitWall'

export default function Hero() {
  return (
    <section className="grid grid-cols-1 items-center gap-10 py-12 md:grid-cols-[1.15fr_1fr] md:py-16">
      <HeroBrandBlock />

      <div className="hidden md:block">
        <PortraitWall />
      </div>
    </section>
  )
}
